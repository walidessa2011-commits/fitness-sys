
import { db } from './src/lib/supabase';

async function seed() {
    const goals = [
        { name: 'تخفيف وزن', description: 'العمل على حرق الدهون وتقليل الوزن الإجمالي.', status: 'نشط' },
        { name: 'زيادة وزن', description: 'بناء الكتلة العضلية وزيادة الوزن بشكل صحي.', status: 'نشط' },
        { name: 'لياقة بدنية', description: 'تحسين قدرة التحمل والنشاط البدني العام.', status: 'نشط' },
        { name: 'كمال أجسام', description: 'التركيز على تضخيم العضلات وتناسق الجسم.', status: 'نشط' }
    ];

    const existing = await db.getAll('member_goals');
    if (!existing || existing.length === 0) {
        for (const goal of goals) {
            await db.add('member_goals', goal);
        }
        console.log('Seeded goals successfully');
    } else {
        console.log('Goals already exist');
    }
}

seed();
