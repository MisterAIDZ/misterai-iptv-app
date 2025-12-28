const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { mac } = req.query;
    // جربنا هذا المسار الأكثر شيوعاً بدلاً من portal.php
    const PORTAL_URL = 'http://testdi.proxytx.cloud/server/load.php'; 

    if (!mac) return res.status(400).json({ error: 'MAC missing' });

    try {
        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) Mag200 sb2 embedded Safari/533.3',
                'Cookie': `mac=${encodeURIComponent(mac)}; stb_lang=en; timezone=GMT`,
                'X-User-Agent': 'Model: MAG250; SW: 2.18-r14-pub-250',
                'Referer': 'http://testdi.proxytx.cloud/c/'
            },
            timeout: 8000 // مهلة 8 ثوانٍ
        };

        // طلب التوكن
        const handshake = await axios.get(`${PORTAL_URL}?type=stb&action=handshake`, config);
        const token = handshake.data.js ? handshake.data.js.token : null;

        if (!token) {
            return res.status(200).json({ 
                error: "السيرفر لم يعطِ توكن. الماك قد يكون منتهياً أو محظوراً.",
                debug: handshake.data 
            });
        }

        // جلب القنوات
        const response = await axios.get(`${PORTAL_URL}?type=itv&action=get_all_channels`, {
            headers: { ...config.headers, 'Authorization': `Bearer ${token}` }
        });

        res.status(200).json(response.data.js.data);
    } catch (error) {
        res.status(500).json({ error: "فشل الاتصال بالسيرفر", message: error.message });
    }
};
