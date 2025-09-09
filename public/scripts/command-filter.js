import { showCommandModal } from './main.js';

export function setupCommandFilter(commands) {
    const searchInput = document.getElementById('command-filter');
    const commandsListDiv = document.getElementById('commands-list');

    function renderCommands(filteredCommands) {
        commandsListDiv.innerHTML = '';
        if (filteredCommands.length === 0) {
            commandsListDiv.innerHTML = '<p style="color: var(--error-color);">No commands found matching your search.</p>';
            return;
        }

        filteredCommands.forEach(cmd => {
            const commandCard = document.createElement('div');
            commandCard.classList.add('command-card');
            commandCard.innerHTML = `
                <h3>${cmd.name}</h3>
                <p>${cmd.description}</p>
                ${cmd.admin ? '<span class="admin-badge">Admin</span>' : ''}
            `;
            commandsListDiv.appendChild(commandCard);

            commandCard.addEventListener('click', () => showCommandModal(cmd));
        });
    }

    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filtered = commands.filter(cmd =>
            cmd.name.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query)
        );
        renderCommands(filtered);
    });

    renderCommands(commands); // Initial render of all commands
}
