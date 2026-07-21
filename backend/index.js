const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.json({ message: 'Sahayak AI backend chal raha hai!' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { problemText } = req.body;

    if (!problemText) {
      return res.status(400).json({ error: 'Problem text zaroori hai' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Tum ek civic problem classifier ho. Ye problem text padho aur SIRF JSON format me jawab do, koi extra text nahi, koi markdown nahi:

Problem: "${problemText}"

JSON format:
{
  "category": "garbage" ya "water" ya "road" ya "electricity" ya "other",
  "priority": "high" ya "medium" ya "low",
  "reasoning": "ek line me kyun ye priority di"
}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedResult = JSON.parse(responseText);

    // Database me save kar
    const { data, error: dbError } = await supabase
      .from('problems')
      .insert([
        {
          problem_text: problemText,
          category: parsedResult.category,
          priority: parsedResult.priority,
          reasoning: parsedResult.reasoning,
        }
      ])
      .select();

    if (dbError) {
      console.log('Database error:', dbError.message);
      return res.status(500).json({ error: 'Database me save nahi hua' });
    }

    res.json(data[0]);
  } catch (error) {
    console.log('ASLI ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/problems', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
// SIGNUP - naya user banao
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.log('Signup error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.log('Login error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// HELP KARO - kisi problem mein help commit karo
app.post('/api/problems/:id/help', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const { data, error } = await supabase
      .from('helpers')
      .insert([{ problem_id: id, user_id: userId }])
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Tu already help kar raha hai isme' });
      }
      throw error;
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.log('Help error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// EK PROBLEM KE HELPERS COUNT KARO
app.get('/api/problems/:id/helpers', async (req, res) => {
  try {
    const { id } = req.params;

    const { count, error } = await supabase
      .from('helpers')
      .select('*', { count: 'exact', head: true })
      .eq('problem_id', id);

    if (error) throw error;

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LEADERBOARD - top helpers
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER KA PROFILE + STATS
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chal raha hai http://localhost:${PORT} pe`);
});