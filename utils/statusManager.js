const colors = require('../UI/colors/colors');
const { getLangSync } = require('./languageLoader');

class StatusManager {
    constructor(client) {
        this.client = client;
        this.updateInterval = null;
        this.isPlaying = false;
        this.currentTrack = null;
        this.guildCount = 0;
    }

    async init() {
        // Cập nhật status ban đầu
        await this.updateStatus();
        
        // Cập nhật status mỗi 30 giây
        this.updateInterval = setInterval(() => {
            this.updateStatus();
        }, 30000);
    }

    async updateStatus() {
        try {
            const lang = getLangSync();
            let statusText = '';
            let statusType = 'LISTENING';

            if (this.isPlaying && this.currentTrack) {
                statusText = `${this.currentTrack.info?.title || 'Unknown'} by ${this.currentTrack.info?.author || 'Unknown Artist'}`;
                statusType = 'LISTENING';
            } else {
                const guildCount = this.client.guilds.cache.size;
                statusText = `music in ${guildCount} servers`;
                statusType = 'LISTENING';
            }

            await this.client.user.setActivity(statusText, { type: statusType });
            console.log(`${colors.cyan}[ STATUS ]${colors.reset} ${colors.green}Updated: ${statusText}${colors.reset}`);
        } catch (error) {
            const lang = getLangSync();
            console.error(`${colors.cyan}[ STATUS ]${colors.reset} ${colors.red}${lang.console?.statusManager?.error?.replace('{message}', error.message) || `Error updating status: ${error.message}`}${colors.reset}`);
        }
    }

    async onTrackStart(guildId) {
        try {
            const player = this.client.riffy?.players.get(guildId);
            if (player && player.current) {
                this.isPlaying = true;
                this.currentTrack = player.current;
                await this.updateStatus();
            }
        } catch (error) {
            // Bỏ qua lỗi
        }
    }

    async onTrackEnd(guildId) {
        try {
            const player = this.client.riffy?.players.get(guildId);
            if (!player || !player.current) {
                this.isPlaying = false;
                this.currentTrack = null;
                await this.updateStatus();
            }
        } catch (error) {
            // Bỏ qua lỗi
        }
    }

    async onPlayerDisconnect(guildId) {
        try {
            const anyPlaying = Array.from(this.client.riffy?.players.values() || []).some(p => p.current);
            if (!anyPlaying) {
                this.isPlaying = false;
                this.currentTrack = null;
                await this.updateStatus();
            }
        } catch (error) {
            // Bỏ qua lỗi
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

module.exports = StatusManager;