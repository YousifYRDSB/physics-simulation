document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('glCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrameId = null;
    let lastTime = 0;
    const gravity = -981; // Adjusted for scale
    let position = { x: 50, y: canvas.height - 50 }; // Starting from (50, 50) from the bottom left
    let velocity = { x: 0, y: 0 };
    let launchAngle = 0;

    // Define the target as a box
    const target = { x: 600, y: canvas.height - 200, width: 40, height: 40 }; // Static target box position and size

    document.getElementById('resetButton').addEventListener('click', resetSimulation);

    function resetSimulation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Ensure no ongoing animations
        }

        const vi = 100 * parseFloat(document.getElementById('vi').value);
        launchAngle = parseFloat(document.getElementById('theta').value); // Stored in degrees

        const radians = launchAngle * Math.PI / 180; // Convert to radians

        // Recalculate initial velocities based on inputs
        velocity.x = vi * Math.cos(radians);
        velocity.y = -vi * Math.sin(radians); // Negative as y-axis is inverted

        // Set projectile's initial position to (50, 50) from the bottom left
        position.x = 50;
        position.y = canvas.height - 50;

        lastTime = 0;
        animationFrameId = requestAnimationFrame(update);

        // Initial overlay update
        updateOverlay(true);
    }

    function drawCannon() {
        const cannonLength = 60;
        const cannonWidth = 10;
        const baseRadius = 20;

        const radians = launchAngle * Math.PI / 180;
        const endX = 50 + cannonLength * Math.cos(radians);
        const endY = canvas.height - 50 - cannonLength * Math.sin(radians);

        ctx.beginPath();
        ctx.lineWidth = cannonWidth;
        ctx.strokeStyle = "black";
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(50, canvas.height - 50, baseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "grey";
        ctx.fill();
    }

    function drawTarget() {
        ctx.fillStyle = "green";
        ctx.fillRect(target.x, target.y, target.width, target.height);

         // Set the text style for the annotation
    ctx.fillStyle = "black"; // Choose a color that contrasts well with the target's color
    ctx.font = "12px Arial"; // Adjust the size and font as needed

    // Calculate text position for better visibility (centering the text on the target)
    const text = "40x40";
    const textWidth = ctx.measureText(text).width;
    const textX = target.x + (target.width / 2) - (textWidth / 2);
    const textY = target.y + (target.height / 2) + 6; // Adjust this value to center the text vertically within the box

    ctx.fillText(text, textX, textY);
    }

    function checkCollision() {
        const withinXBounds = position.x >= target.x && position.x <= (target.x + target.width);
        const withinYBounds = position.y >= target.y && position.y <= (target.y + target.height);
        return withinXBounds && withinYBounds;
    }

    function update(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = (timestamp - lastTime) / 1000; // in seconds
        lastTime = timestamp;

        // Apply gravity and update position
        velocity.y -= gravity * deltaTime;
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCannon();
        drawTarget();

        // Call the new functions to draw distance lines and annotations
    drawDistanceLines();
    annotateDistance();

        ctx.beginPath();
        ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();

        // Pause the simulation if the projectile hits the target or reaches the ground
        if (checkCollision() || position.y >= canvas.height) {
            cancelAnimationFrame(animationFrameId);
            return; // Exit the update loop
        }

         // Stop the animation if the projectile hits the target or reaches y=50 from the bottom
    if (checkCollision() || position.y > canvas.height - 50) {
        cancelAnimationFrame(animationFrameId); // Pause the simulation
        return; // Exit the update loop
    }


        animationFrameId = requestAnimationFrame(update);

        // Update overlay without initial flag
        updateOverlay(false);
    }

    function updateOverlay(initial) {
        if (initial) {
            document.getElementById('startVel').textContent = `${(Math.sqrt(velocity.x ** 2 + velocity.y ** 2)/100).toFixed(2)}`;
            document.getElementById('startPos').textContent = `(${(position.x/100).toFixed(2)}, ${((canvas.height - position.y)/100).toFixed(2)})`;
            document.getElementById('angle').textContent = `${launchAngle} degrees`;
        }
        // Always update current velocity and position
        document.getElementById('currentVel').textContent = `${(Math.sqrt(velocity.x ** 2 + velocity.y ** 2)/100).toFixed(2)}`;
        document.getElementById('currentPos').textContent = `(${(position.x/100).toFixed(2)}, ${((canvas.height - position.y)/100).toFixed(2)})`;
    }

    function drawDistanceLines() {
        // Draw line for X difference
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 50); // Start from cannon base
        ctx.lineTo(target.x, canvas.height - 50); // Horizontal line to target's X
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // Semi-transparent blue
        ctx.stroke();
    
        // Draw line for Y difference
        ctx.beginPath();
        ctx.moveTo(target.x, canvas.height - 50); // Start from the end of the X difference line
        ctx.lineTo(target.x, target.y); // Vertical line to target's Y
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
        ctx.stroke();
    }
    
    function annotateDistance() {
        const xDiff = Math.abs(5- - target.x);
        const yDiff = Math.abs((canvas.height - 50) - target.y);
    
        // Annotate X difference
        ctx.fillStyle = 'blue';
        ctx.font = '16px Arial';
        ctx.fillText(`Δx: ${xDiff} px`, (50 + target.x) / 2, canvas.height - 50 + 20); // Halfway along the line
    
        // Annotate Y difference
        ctx.fillStyle = 'red';
        ctx.fillText(`Δy: ${yDiff} px`, target.x + 5, (canvas.height - 50 + target.y) / 2); // Halfway along the line
    }

});
