const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // البيانات المستخرجة من اشتراك Michelle
    const HOST = 'http://2.00322.xyz:8000';
    const USER = 'Michelle';
    const PASS = 'QHJXZQG3AF';

    try {
        // نستخدم رابط الـ player_api لأنه الأكثر استقراراً
        const apiUrl = `${HOST}/player_api.php?username=${USER}&password=${PASS}&action=get_live_streams`;
        
        const response = await axios.get(apiUrl, { timeout: 10000 });

        // التأكد من أن السيرفر أعاد قائمة مصفوفة
        if (!Array.isArray(response.data)) {
            return res.status(200).json({ error: "السيرفر لم يرسل قنوات. تأكد من حالة الاشتراك." });
        }

        // نأخذ أول 40 قناة للتجربة
        const channels = response.data.slice(0, 40).map(ch => ({
            name: ch.name,
            url: `${HOST}/live/${USER}/${PASS}/${ch.stream_id}.ts`,
            id: ch.stream_id
        }));

        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ error: "فشل الاتصال: " + error.message });
    }
};
