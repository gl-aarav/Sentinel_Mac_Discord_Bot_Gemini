import { fetchBotStatus as fetchBotStatusFromApi } from './api-data.js';
import { setupCommandFilter } from './command-filter.js';

document.addEventListener('DOMContentLoaded', async () => {
    // IntersectionObserver for fade-in effect
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Initial fetches and set up intervals
    await fetchBotStatusFromApi();
    setInterval(fetchBotStatusFromApi, 30000); // Update status every 30 seconds

    // Fetch commands and set up filter
    try {
        const response = await fetch('/commands.json');
        const commands = await response.json();
        setupCommandFilter(commands);
    } catch (error) {
        console.error('Error fetching commands:', error);
        const commandsListDiv = document.getElementById('commands-list');
        commandsListDiv.innerHTML = '<p style="color: var(--error-color);">Failed to load commands.</p>';
    }

    setupModal();
});

// Add this to your main.js file
function setupModal() {
    const modal = document.getElementById('command-modal');
    const closeBtn = document.querySelector('.close-button');

    // Close the modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    // Close modal if user clicks outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

// Function to populate and show the modal
export function showCommandModal(command) {
    const modal = document.getElementById('command-modal');
    document.getElementById('modal-title').textContent = command.name;
    document.getElementById('modal-description').textContent = command.description;
    const detailsDiv = document.getElementById('modal-details');
    detailsDiv.innerHTML = ''; // Clear previous content

    if (command.admin) {
        detailsDiv.innerHTML += '<p><strong>Permissions:</strong> Admin</p>';
    }
    if (command.usage) {
        detailsDiv.innerHTML += `<p><strong>Usage:</strong> ${command.usage}</p>`;
    }
    modal.style.display = "block";
}
