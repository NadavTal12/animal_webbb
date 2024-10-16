// פונקציה ליצירת גרף עמודות
function createBarChart(data, elementId, xLabel, yLabel) {
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(`#${elementId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value));

    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text(xLabel);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text(yLabel);
}

function createLineChart(data, elementId, xLabel, yLabel) {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select(`#${elementId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.1);
  
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);
  
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
  
    svg.append("g")
        .call(d3.axisLeft(y));
  
    svg.selectAll(".line")
        .data([data])
        .enter().append("path")
        .attr("class", "line")
        .attr("d", d3.line()
            .x(d => x(d.label) + x.bandwidth() / 2)
            .y(d => y(d.value))
        )
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", 2);
  
    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text(xLabel);
  
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text(yLabel);
  }

// משיכת נתונים והצגת גרף מכירות לפי ספק
async function fetchSalesBySupplier() {
    try {
        const response = await fetch('/bi/sales_analysis_by_supplier');
        const data = await response.json();

        const formattedData = data.map(item => ({
            label: item.supplierName,
            value: item.totalRevenue
        }));

        createBarChart(formattedData, 'chart1', 'ספק', 'סה"כ מכירות');
    } catch (error) {
        console.error('Error fetching sales by supplier:', error);
    }
}

// משיכת נתונים והצגת גרף מוצרים הנמכרים ביותר
async function fetchBestSellers() {
    try {
        const response = await fetch('/bi/top_best_sellers?n=5');
        const data = await response.json();

        const formattedData = data.map(item => ({
            label: item.productName,
            value: item.amountSold
        }));

        createBarChart(formattedData, 'chart2', 'מוצר', 'סה"כ נמכר');
    } catch (error) {
        console.error('Error fetching best sellers:', error);
    }
}

// משיכת נתונים והצגת גרף הכנסות לפי מאפיין
async function fetchRevenueByAttribute() {
    try {
        const response = await fetch(`/bi/revenue_by_attribute?attribute=shop&startDate=2024-01-01&endDate=2024-12-31`);
        const data = await response.json();

        const formattedData = data.map(item => ({
            label: item.attributeValue,
            value: item.totalRevenue
        }));

        createBarChart(formattedData, 'chart3', 'חנות', 'סה"כ הכנסות');
    } catch (error) {
        console.error('Error fetching revenue by attribute:', error);
    }
}

// טעינת כל הגרפים עם הטענת העמוד
document.addEventListener('DOMContentLoaded', function () {
    fetchSalesBySupplier();
    fetchBestSellers();
    fetchRevenueByAttribute();
    fetchOrdersByDay();
});
