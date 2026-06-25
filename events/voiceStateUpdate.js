const { ChannelType } = require('discord.js');

// Map để lưu trữ status ban đầu của mỗi kênh voice
const voiceChannelStatuses = new Map();

module.exports = async (client, oldState, newState) => {
    try {
        // Kiểm tra nếu bot tham gia voice channel
        if (newState.member.id === client.user.id && newState.channelId && !oldState.channelId) {
            const voiceChannel = newState.channel;
            
            // Lưu trữ status ban đầu của kênh voice
            if (voiceChannel) {
                voiceChannelStatuses.set(voiceChannel.id, voiceChannel.topic || '');
                console.log(`[VOICE STATUS] Lưu status kênh ${voiceChannel.name}: "${voiceChannel.topic || '(trống)'}"`);
            }
        }

        // Kiểm tra nếu bot rời voice channel
        if (oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
            const voiceChannel = oldState.channel;
            
            // Khôi phục status ban đầu của kênh voice
            if (voiceChannel && voiceChannelStatuses.has(voiceChannel.id)) {
                const originalStatus = voiceChannelStatuses.get(voiceChannel.id);
                
                if (voiceChannel.permissionsFor(client.user).has('ManageChannels')) {
                    try {
                        await voiceChannel.edit({ topic: originalStatus });
                        console.log(`[VOICE STATUS] Khôi phục status kênh ${voiceChannel.name}: "${originalStatus || '(trống)'}"`);
                    } catch (error) {
                        console.error(`[VOICE STATUS] Lỗi khi khôi phục status: ${error.message}`);
                    }
                }
                
                voiceChannelStatuses.delete(voiceChannel.id);
            }
        }
    } catch (error) {
        console.error('Error in voiceStateUpdate event:', error);
    }
};
