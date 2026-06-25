const { ChannelType } = require('discord.js');

module.exports = async (client, oldState, newState) => {
    try {
        // Bot không thay đổi status kênh voice - chỉ giữ nguyên
        if (newState.member.id === client.user.id && newState.channelId && !oldState.channelId) {
            const voiceChannel = newState.channel;
            if (voiceChannel) {
                console.log(`[VOICE] Bot tham gia kênh voice: ${voiceChannel.name}`);
            }
        }

        if (oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
            const voiceChannel = oldState.channel;
            if (voiceChannel) {
                console.log(`[VOICE] Bot rời khỏi kênh voice: ${voiceChannel.name}`);
            }
        }
    } catch (error) {
        console.error('Error in voiceStateUpdate event:', error);
    }
};
