const { connectToDB } = require('../config/db'); // Import the connectToDB function

class BIModel {
  constructor() {
    this.db = null;
  }

  // Initialize the database connection
  async init() {
    if (!this.db) {
      this.db = await connectToDB(); // Connect to the database
    }
  }

  // Get sales analysis by supplier
  async getSalesAnalysisBySupplier() {
    await this.init(); // Ensure database is initialized
    try {
      const result = await this.db.collection('products').aggregate([
        {
          $group: {
            _id: "$supplier", // Group by supplier UUID
            totalRevenue: { 
              $sum: { $multiply: ["$price", "$amount_sold"] } // Calculate total revenue
            },
            totalProductsSold: { 
              $sum: "$amount_sold" // Count total products sold
            }
          }
        },
        {
          $lookup: {
            from: "suppliers", // Join with suppliers collection
            localField: "_id",
            foreignField: "uuid",
            as: "supplierDetails"
          }
        },
        {
          $unwind: "$supplierDetails" // Unwind the supplier details
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            supplierName: "$supplierDetails.name", // Include supplier name from join
            totalRevenue: 1,
            totalProductsSold: 1
          }
        }
      ]).toArray();

      return result;
    } catch (error) {
      console.error('Error performing sales analysis by supplier:', error);
      throw error;
    }
  }

  // Get top N best-selling products
  async getTopBestSellers(n) {
    await this.init(); // Ensure database is initialized
    try {
      const result = await this.db.collection('products').aggregate([
        {
          $sort: { amount_sold: -1 } // Sort by amount_sold in descending order
        },
        {
          $limit: n // Limit to the top N products
        },
        {
          $project: {
            _id: 0,
            productName: "$name", // Include product name
            amountSold: "$amount_sold",
            revenue: { $multiply: ["$price", "$amount_sold"] } // Calculate revenue per product
          }
        }
      ]).toArray();

      return result;
    } catch (error) {
      console.error('Error fetching top best sellers:', error);
      throw error;
    }
  }

  // Get revenue grouped by a dynamic attribute and filter by date using JavaScript
  async getRevenueByAttribute(attribute, startDate, endDate) {
    await this.init(); // Ensure database is initialized
    try {
      // Step 1: Fetch all orders with the specified attribute and join with stores
      const orders = await this.db.collection('orders').aggregate([
        {
          $lookup: {
            from: 'stores', // טבלת החנויות
            localField: attribute, // שדה ההזמנה שבו נמצא ה-UUID של החנות
            foreignField: 'uuid', // שדה ה-UUID של החנות בטבלת החנויות
            as: 'storeDetails' // שם השדה החדש שיתווסף למסמכים
          }
        },
        {
          $unwind: '$storeDetails' // פיצול המסמכים כך שיהיה גישה לשדות של החנות
        },
        {
          $group: {
            _id: '$storeDetails.name', // קיבוץ לפי שם החנות
            orders: { $push: "$$ROOT" } // Push the entire order document into an array
          }
        }
      ]).toArray();

      // Step 2: Convert startDate and endDate to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Step 3: Filter orders by date in JavaScript
      const filteredResults = orders.map(group => {
        // Filter the orders array by the date range
        const filteredOrders = group.orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= start && orderDate <= end;
        });

        // Calculate total revenue for the filtered orders
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.price, 0);

        return {
          attributeValue: group._id, // Include the name of the store
          totalRevenue // Include the total revenue
        };
      }).filter(group => group.totalRevenue > 0); // Only include groups with revenue

      return filteredResults;
    } catch (error) {
      console.error(`Error calculating revenue by ${attribute}:`, error);
      throw error;
    }
  }

}

module.exports = new BIModel();