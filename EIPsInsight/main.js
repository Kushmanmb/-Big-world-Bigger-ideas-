import './style.css';

console.log('🔍 EIPsInsight loaded successfully!');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialized');
  
  // Add some interactivity
  const header = document.querySelector('header h1');
  if (header) {
    header.addEventListener('click', () => {
      console.log('Header clicked!');
      header.style.color = header.style.color === 'rgb(99, 102, 241)' ? '' : '#6366f1';
    });
  }
});

// Display current date
const footer = document.querySelector('footer p');
if (footer) {
  const currentYear = new Date().getFullYear();
  footer.textContent = `Part of the Big World Bigger Ideas project - ${currentYear}`;
}
