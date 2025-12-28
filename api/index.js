const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    // البيانات المستخرجة من الصورة التي أرسلتها
    const HOST = 'http://2.00322.xyz:8000';
    const USER = 'Michelle';
    const PASS = 'QHJXZQG3AF';

    try {
        // طلب قائمة القنوات عبر API الـ Xtream
        const apiUrl = `${HOST}/player_api.php?username=${USER}&password=${PASS}&action=get_live_streams`;
        
        const response = await axios.get(apiUrl, { timeout: 10000 });

        if (!Array.isArray(response.data)) {
            return res.status(200).json({ error: "بيانات الدخول غير صحيحة أو السيرفر متوقف" });
        }

        // تحويل البيانات لتناسب الواجهة وتجهيز روابط البث
        const channels = response.data.slice(0, 50).map(ch => ({
            name: ch.name,
            // رابط البث المباشر بصيغة .ts
            url: `${HOST}/live/${USER}/${PASS}/${ch.stream_id}.ts`,
            id: ch.stream_id
        }));

        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ error: "فشل الاتصال: " + error.message });
    }
};
