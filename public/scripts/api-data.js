export async function fetchBotStatus() {
    try {
        const response = await fetch('/api/bot-status');
        const data = await response.json();

        if (data.status === 'online') {
            document.getElementById('bot-status').innerHTML = `<span class="status-indicator status-online"></span> Online`;
            document.getElementById('bot-latency').textContent = `${data.latency}ms`;
            const uptimeSeconds = Math.floor(data.uptime / 1000);
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = uptimeSeconds % 60;
            document.getElementById('bot-uptime').textContent = `${hours}h ${minutes}m ${seconds}s`;
            document.getElementById('bot-guilds').textContent = data.guilds;
            document.getElementById('bot-users').textContent = data.users;
        } else {
            document.getElementById('bot-status').innerHTML = `<span class="status-indicator status-offline"></span> Offline`;
            document.getElementById('bot-latency').textContent = 'N/A';
            document.getElementById('bot-uptime').textContent = 'N/A';
            document.getElementById('bot-guilds').textContent = 'N/A';
            document.getElementById('bot-users').textContent = 'N/A';
        }
    } catch (error) {
        console.error('Error fetching bot status:', error);
    }
}
