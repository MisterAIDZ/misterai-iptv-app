const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // بيانات Xtream الجديدة التي أرسلتها
    const XTREAM_URL = 'http://2.00322.xyz:8000/player_api.php';
    const username = 'Michelle';
    const password = 'QHJXZQG3AF';

    try {
        // جلب قائمة القنوات مباشرة عبر API الـ Xtream
        const response = await axios.get(XTREAM_URL, {
            params: {
                username: username,
                password: password,
                action: 'get_live_streams' // جلب قنوات البث المباشر
            }
        });

        // إرسال أول 100 قناة فقط لتسريع التحميل في البداية
        const channels = response.data.slice(0, 100).map(ch => ({
            name: ch.name,
            url: `http://2.00322.xyz:8000/live/${username}/${password}/${ch.stream_id}.ts`,
            id: ch.stream_id,
            icon: ch.stream_icon
        }));

        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ error: "فشل الاتصال بسيرفر Xtream", details: error.message });
    }
};
