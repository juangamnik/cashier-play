export function animateButtonPress(key) {
    const buttons = document.querySelectorAll('.numpad button');
    buttons.forEach(btn => {
        if (btn.textContent === key || 
            (key === 'Enter' && btn.classList.contains('enter')) ||
            (key.toLowerCase() === 'x' && btn.classList.contains('multiply'))) 
        {
            btn.classList.add('active');

            const ripple = document.createElement('span');
            ripple.classList.add('ripple-animate');
            btn.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 400);

            setTimeout(() => btn.classList.remove('active'), 150);
        }
    });
}

export function showErrorBorder() {
    const enterButton = document.querySelector('.enter');
    enterButton.classList.add('error');
    setTimeout(() => enterButton.classList.remove('error'), 1000);
}