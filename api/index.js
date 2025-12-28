const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات السماح لجميع النطاقات بالوصول (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    // بيانات Michelle المستخرجة من النص الذي أرسلته
    const HOST = 'http://2.00322.xyz:8000';
    const USER = 'Michelle';
    const PASS = 'QHJXZQG3AF';

    try {
        // استخدام رابط player_api لجلب القنوات بشكل منظم
        const apiUrl = `${HOST}/player_api.php?username=${USER}&password=${PASS}&action=get_live_streams`;
        
        const response = await axios.get(apiUrl, { 
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // التحقق من صحة البيانات القادمة من السيرفر
        if (!Array.isArray(response.data)) {
            return res.status(200).json({ error: "بيانات غير صالحة من السيرفر" });
        }

        // معالجة أول 50 قناة فقط لضمان سرعة الاستجابة
        const channels = response.data.slice(0, 50).map(ch => ({
            name: ch.name,
            // إنشاء رابط البث المباشر لكل قناة
            url: `${HOST}/live/${USER}/${PASS}/${ch.stream_id}.ts`,
            id: ch.stream_id,
            category: ch.category_id
        }));

        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ error: "فشل الاتصال: " + error.message });
    }
};
