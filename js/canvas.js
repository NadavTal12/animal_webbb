const reviewsCanvas = document.getElementById('reviewsCanvas');
const reviewsCtx = reviewsCanvas.getContext('2d');

// Set canvas width to match the full viewport width
function resizeCanvas() {
    reviewsCanvas.width = window.innerWidth;
}

// Run once and whenever the window is resized
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Replace facts with reviews
const reviews = [
    '״שירות מעולה ומוצרים איכותיים! בהחלט אחזור שוב.״ - לקוח מרוצה',
    '״החתול שלי מאוהב בצעצועים שקניתי כאן! ממליץ בחום.״ - דנה מ.',
    '״המוצרים הגיעו מהר מאוד והשירות היה אדיב ומקצועי.״ - יוסי ק.',
    '״מצאתי את כל מה שהייתי צריכה לכלב שלי, ומחירים הוגנים.״ - ענת ר.',
    '״מבחר עצום של מוצרים ואיכות מעולה!״ - אורי ל.'
];

let currentReviewIndex = 0;
let reviewX = reviewsCanvas.width; // Start off-canvas
const reviewSpeed = 2;

function drawReview() {
    reviewsCtx.clearRect(0, 0, reviewsCanvas.width, reviewsCanvas.height);

    // Draw review bubble
    reviewsCtx.fillStyle = '#C9DFB9';
    reviewsCtx.fillRect(reviewX, 75, 250, 50);

    // Draw the review text
    reviewsCtx.fillStyle = '#000';
    reviewsCtx.font = '20px Arial';
    reviewsCtx.fillText(reviews[currentReviewIndex], reviewX - 12, 105);

    // Update position for animation
    reviewX -= reviewSpeed;
    if (reviewX + 600 < 0) {
        reviewX = reviewsCanvas.width;
        currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
    }

    requestAnimationFrame(drawReview);
}

drawReview();