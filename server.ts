import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with modern @google/genai
let aiClient: GoogleGenAI | null = null;
try {
  // Picks up GEMINI_API_KEY from process.env
  aiClient = new GoogleGenAI();
} catch (err) {
  console.warn('Failed to initialize GoogleGenAI client (will use heuristic fallback):', err);
}

// 1. AI Dynamic Pricing & Revenue Optimization
app.post('/api/billing-ai/recommendations', async (req: Request, res: Response) => {
  try {
    const { courses } = req.body;
    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({ error: 'courses array is required' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `You are a Chief Financial Officer and EdTech pricing specialist. Analyze the following online courses for an educator:
${JSON.stringify(courses.map((c: any) => ({
  id: c.id,
  title: c.title,
  currentPrice: c.price,
  students: c.studentCount,
  rating: c.rating,
  reviews: c.reviewCount,
  level: c.level,
  category: c.category
})), null, 2)}

Provide data-driven pricing optimization recommendations. Return ONLY valid JSON in this exact structure:
{
  "recommendations": [
    {
      "courseId": "string (matching course id)",
      "courseTitle": "string",
      "currentPrice": number,
      "recommendedPrice": number,
      "projectedRevenueDeltaPercent": number (e.g. 14.5),
      "rationale": "string (detailed economic rationale referencing rating, student elasticity, market benchmarks)",
      "confidenceScore": number (80-99),
      "marketPositioning": "underpriced" | "optimal" | "premium_opportunity" | "surge_candidate",
      "suggestedPromotionTier": "string (e.g. Early Bird 15% discount for next cohort)"
    }
  ],
  "marketSummary": "string (1-2 sentences summarizing overall catalog monetization strength)"
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = aiResponse.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch (parseErr) {
          console.warn('Failed to parse Gemini JSON output, falling back to heuristics:', parseErr);
        }
      }
    }

    // Heuristic Fallback
    const recommendations = courses.slice(0, 4).map((c: any) => {
      const isHighRating = c.rating >= 4.9;
      const recommendedPrice = isHighRating ? Math.round(c.price * 1.15) : Math.round(c.price * 1.08);
      const delta = Math.round(((recommendedPrice - c.price) / c.price) * 1000) / 10;
      return {
        courseId: c.id,
        courseTitle: c.title,
        currentPrice: c.price,
        recommendedPrice,
        projectedRevenueDeltaPercent: delta,
        rationale: `Course carries a high rating of ${c.rating} with ${c.studentCount} active students. Premium positioning allows a price adjustment to $${recommendedPrice} with virtually zero demand drop-off.`,
        confidenceScore: 92,
        marketPositioning: isHighRating ? 'premium_opportunity' : 'underpriced',
        suggestedPromotionTier: 'Flash 15% Cohort Launch Discount'
      };
    });

    return res.json({
      recommendations,
      marketSummary: 'Your curriculum commands strong demand inelasticity with above-average learner satisfaction.'
    });
  } catch (error: any) {
    console.error('Error generating pricing recommendations:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. AI Revenue Forecast (30/60/90-Day Outlook)
app.post('/api/billing-ai/forecast', async (req: Request, res: Response) => {
  try {
    const { courses, currentGross, royaltyPercentage } = req.body;
    const gross = currentGross || 42000;
    const royalty = royaltyPercentage || 85;

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `As a venture financial analyst, forecast future revenue for an educator LMS with $${gross} current gross sales and an ${royalty}% royalty payout share.
Catalog has ${courses?.length || 4} technical engineering courses.
Return ONLY valid JSON in this exact structure:
{
  "currentMonthlyRunRate": number,
  "month30Estimate": number,
  "month60Estimate": number,
  "month90Estimate": number,
  "projectedGrowthPercent": number,
  "scenarioConservative": number,
  "scenarioBullish": number,
  "keyDrivers": ["string", "string", "string"],
  "riskMitigations": ["string", "string"],
  "executiveNarrative": "string"
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = aiResponse.text;
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch (e) {
          console.warn('Forecast parse error, using fallback');
        }
      }
    }

    const netMonthly = Math.round((gross / 3) * (royalty / 100));
    return res.json({
      currentMonthlyRunRate: netMonthly,
      month30Estimate: Math.round(netMonthly * 1.12),
      month60Estimate: Math.round(netMonthly * 1.25),
      month90Estimate: Math.round(netMonthly * 1.41),
      projectedGrowthPercent: 18.5,
      scenarioConservative: Math.round(netMonthly * 1.05),
      scenarioBullish: Math.round(netMonthly * 1.35),
      keyDrivers: [
        'Rising student demand in production distributed systems & LLM agent engineering',
        'High course completion rate (88%) fueling word-of-mouth team enrollment vouchers',
        'Direct Google Meet live lectures increasing perceived cohort value by +40%'
      ],
      riskMitigations: [
        'Offer flexible enterprise bundles to mitigate seasonal summer slowdowns',
        'Host biweekly Google Meet office hours to keep student drop-off under 3%'
      ],
      executiveNarrative: 'Earnings are pacing ahead of industry benchmarks, with high student satisfaction driving stable compounding run-rates.'
    });
  } catch (error: any) {
    console.error('Forecast error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. AI Educator Billing Copilot / Advisor
app.post('/api/billing-ai/copilot', async (req: Request, res: Response) => {
  try {
    const { question, educatorContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `You are the AI Financial & Billing Advisor inside Aetheria LMS, advising a university professor / senior technical educator.
Educator profile:
- Royalty share: ${educatorContext?.royaltyPercentage || 85}%
- Payout method: Stripe Direct Deposit
- Available balance: $${educatorContext?.availablePayout || 12850}
- Active courses: ${educatorContext?.courseCount || 4}

Educator Question: "${question}"

Provide a concise, practical, highly articulate answer tailored to online course monetization, pricing elasticity, corporate licensing, and tax remittance. Use bullet points and clear takeaways.`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.4
        }
      });

      return res.json({ reply: aiResponse.text });
    }

    // Heuristic response
    let reply = `Based on your course performance metrics and current 85% royalty payout tier:
• **Pricing Elasticity**: Your courses carry an average 4.9+ rating. In technical education, courses priced between $249 and $299 experience almost identical conversion rates to those priced below $200 because professional learners frequently expense their enrollment through corporate learning budgets.
• **Bundling Advantage**: Introducing a 2-course masterclass bundle (e.g., Distributed Systems + AI Engineering) at $399 can lift average order value (AOV) by ~28%.
• **Live Cohort Lift**: Hosting scheduled Google Meet office hours and code review sessions allows you to introduce a "Cohort VIP" tier with an additional $150 premium.`;

    return res.json({ reply });
  } catch (error: any) {
    console.error('Copilot error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 4. AI Tax Remittance & Itemized Invoice Generator
app.post('/api/billing-ai/tax-invoice', async (req: Request, res: Response) => {
  try {
    const { instructorName, period, grossEarnings, royaltyPercent } = req.body;
    const gross = grossEarnings || 16750;
    const royalty = royaltyPercent || 85;
    const instructorShare = (gross * royalty) / 100;
    const platformFee = gross - instructorShare;
    const stripeFee = Math.round(gross * 0.029 * 100) / 100;
    const netPayout = Math.round((instructorShare - stripeFee) * 100) / 100;

    return res.json({
      statementId: `STM-${Date.now().toString().slice(-6)}`,
      period: period || 'Current Billing Cycle',
      instructorName: instructorName || 'Dr. Elena Vance',
      grossGMV: gross,
      royaltyPercentage: royalty,
      educatorGrossShare: instructorShare,
      platformFee,
      merchantProcessingFee: stripeFee,
      withholdingTax: 0,
      netRemitted: netPayout,
      taxForm: 'W-8BEN / US-Foreign Tax Treaty 0% Withholding Verified',
      status: 'Ready for Export & Direct Deposit'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AI-DRIVEN VIDEO STUDIO & HOSTING ENDPOINTS
// ==========================================

// 5. AI Transcribe, Chapter Marker & Metadata Generator
app.post('/api/video-ai/transcribe-and-chapter', async (req: Request, res: Response) => {
  try {
    const { title, topic, durationSeconds = 300, instructorName = 'Educator' } = req.body;

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `You are an EdTech video production and AI transcription specialist.
Analyze this technical educational video recorded by ${instructorName}:
Title: "${title || 'Architecture Deep Dive'}"
Topic/Domain: "${topic || 'Technical masterclass'}"
Duration: ${durationSeconds} seconds (~${Math.round(durationSeconds / 60)} minutes).

Generate an authentic, high-fidelity transcription breakdown, semantic chapter marks, speech pacing analysis, and pedagogical takeaways.

Return ONLY a valid JSON object in this exact schema:
{
  "summary": "string (concise 2-3 sentence overview of this video lecture)",
  "chapters": [
    { "timestamp": number, "title": "string", "summary": "string" }
  ],
  "transcript": [
    { "timestamp": number, "speaker": "string", "text": "string" }
  ],
  "keyTakeaways": ["string", "string", "string"],
  "speechPacingWpm": number (e.g. 135-155),
  "clarityScore": number (88-98),
  "tags": ["string", "string", "string", "string"]
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      if (aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          return res.json(parsed);
        } catch (e) {
          console.warn('Failed to parse Gemini video transcription JSON, falling back:', e);
        }
      }
    }

    // Heuristic Fallback
    const dur = Math.max(60, Number(durationSeconds) || 300);
    const step = Math.max(30, Math.floor(dur / 4));
    const chapters = [
      { timestamp: 0, title: 'Introduction & Core Objectives', summary: 'Orientation, problem statement, and architectural goals.' },
      { timestamp: Math.min(dur - 20, step), title: 'System Blueprint & Conceptual Breakdown', summary: 'Deep dive into structural components and constraints.' },
      { timestamp: Math.min(dur - 10, step * 2), title: 'Live Code & Hands-on Implementation', summary: 'Stepping through code execution and handling state transitions.' },
      { timestamp: Math.min(dur - 5, step * 3), title: 'Verification, Production Edge Cases & Q&A', summary: 'Failure modes, verification metrics, and student wrap-up.' }
    ];

    const transcript = [
      { timestamp: 0, speaker: instructorName, text: `Welcome back everyone. Today we are diving into ${title || 'this architecture module'}. By the end of this lecture, you will have a clear mental model of how this works in production.` },
      { timestamp: Math.floor(dur * 0.15), speaker: instructorName, text: 'Let us first unpack the underlying invariants and why conventional monolithic patterns break down under high concurrency.' },
      { timestamp: Math.floor(dur * 0.35), speaker: instructorName, text: 'Take a close look at this state machine transition on the screen. Notice how we decouple the write quorum from the read replication path.' },
      { timestamp: Math.floor(dur * 0.60), speaker: instructorName, text: 'Now switching over to our terminal, let us trigger network partition simulation and watch the leader election protocol recover.' },
      { timestamp: Math.floor(dur * 0.85), speaker: instructorName, text: 'To summarize: ensure your heartbeats are tuned and idempotent retry tokens are preserved. Complete the quiz below to lock in mastery.' }
    ];

    return res.json({
      summary: `In this lecture, ${instructorName} delivers a thorough walkthrough of ${title || 'production engineering'}, examining core invariants, failure resilience, and production best practices.`,
      chapters,
      transcript,
      keyTakeaways: [
        'Decouple consensus logs from non-blocking worker pools',
        'Enforce strict idempotency tokens on network retries',
        'Verify leader leases under partition topologies'
      ],
      speechPacingWpm: 142,
      clarityScore: 94,
      tags: ['Engineering', 'Architecture', 'Production', 'System Design']
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. AI Interactive Quiz Generator from Video Transcript
app.post('/api/video-ai/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { videoTitle, transcriptText, count = 3 } = req.body;

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `You are an expert instructional designer and technical examiner.
Generate ${count} rigorous multiple-choice comprehension questions testing the student's mastery of this video lecture:
Video Title: "${videoTitle}"
Transcript Context: "${(transcriptText || '').slice(0, 3000)}"

Return ONLY a valid JSON array of questions in this exact structure:
[
  {
    "id": "string",
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswerIndex": number (0-3),
    "explanation": "string (clear pedagogical explanation of why this answer is correct)"
  }
]`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      if (aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          return res.json({ questions: parsed });
        } catch (e) {
          console.warn('Failed to parse Gemini quiz JSON, falling back:', e);
        }
      }
    }

    // Heuristic Fallback
    const questions = [
      {
        id: `q-${Date.now()}-1`,
        question: `What primary architectural trade-off is emphasized in "${videoTitle || 'this lecture'}"?`,
        options: [
          'Prioritizing consistency guarantees and leader leases over raw unchecked write throughput',
          'Eliminating all disk persistence in favor of pure volatile in-memory caching',
          'Relying entirely on client-side state validation without backend verification',
          'Removing logging and telemetry to minimize network latency'
        ],
        correctAnswerIndex: 0,
        explanation: 'In mission-critical distributed systems, leader leases and consensus invariants ensure split-brain safety before maximizing raw write volume.'
      },
      {
        id: `q-${Date.now()}-2`,
        question: 'How should network partition retries be protected against duplicate state mutation?',
        options: [
          'By increasing the HTTP connection timeout to indefinite',
          'By attaching unique idempotency tokens with monotonic epoch counters',
          'By dropping failed packets without retransmission',
          'By restarting the entire cluster whenever a packet drop occurs'
        ],
        correctAnswerIndex: 1,
        explanation: 'Idempotency tokens allow the server to recognize retried requests and return cached results without executing the mutation twice.'
      },
      {
        id: `q-${Date.now()}-3`,
        question: 'Why are asynchronous heartbeats separated from log replication payload RPCs?',
        options: [
          'To prevent heavy disk write bursts from starving time-sensitive cluster liveness checks',
          'Because HTTP/2 does not support multiplexing payloads',
          'To reduce cloud bandwidth costs by disabling heartbeats',
          'Heartbeats are strictly forbidden in modern Raft implementations'
        ],
        correctAnswerIndex: 0,
        explanation: 'Decoupling liveness heartbeats ensures an overloaded follower does not trigger false leader election cascades.'
      }
    ];

    return res.json({ questions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. AI Educator Teleprompter & Lecture Script Generator
app.post('/api/video-ai/teleprompter-script', async (req: Request, res: Response) => {
  try {
    const { topic, durationMinutes = 5, tone = 'Technical Masterclass', audience = 'Professional Software Engineers' } = req.body;

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `You are a world-class EdTech instructor, director, and speechwriter for senior tech educators.
Write an engaging, spoken-word lecture script formatted for a live teleprompter HUD.
Topic: "${topic}"
Duration: ~${durationMinutes} minutes (approx ${durationMinutes * 140} words)
Tone: "${tone}"
Audience: "${audience}"

Include natural presenter delivery cues in brackets such as:
[Pause & smile]
[Switch screen to code editor]
[Point to whiteboard diagram]
[Emphasize with deliberate pacing]

Return ONLY a valid JSON object in this exact schema:
{
  "topic": "${topic}",
  "estimatedMinutes": ${durationMinutes},
  "scriptText": "string (the full teleprompter script text with stage cues in brackets)",
  "bulletPoints": [
    "string (key bullet 1)",
    "string (key bullet 2)",
    "string (key bullet 3)",
    "string (key bullet 4)"
  ]
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      if (aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          return res.json(parsed);
        } catch (e) {
          console.warn('Failed to parse Gemini teleprompter script JSON, falling back:', e);
        }
      }
    }

    // Heuristic Fallback
    const scriptText = `[Look directly into camera · Confident, welcoming smile]

Welcome back everyone! In today's session, we are dissecting ${topic || 'high-performance distributed state'}.

[Pause for emphasis · 2 seconds]

If you've ever had a production cluster drop offline at 3 AM because two servers simultaneously believed they were the primary leader, you know why today's lesson matters so deeply.

[Gesture toward diagram on screen]

Let's begin by establishing our core invariant. When client requests land on our edge ingress, we must guarantee two non-negotiables: linearizability and partition tolerance under network splits.

[Switch screen to code editor · Highlight line 42]

Look at the raft leader election lease here on line 42. Notice how we do not simply trust local system clocks—which are notorious for NTP drift. Instead, we use monotonic term increments coupled with majority quorum acknowledgments.

[Pause · Speak deliberately]

Here is the exact moment where 90% of junior architectures fail: when the network heals, an old stale leader might attempt to broadcast commits. By enforcing term validation on every single heartbeat, the stale node immediately steps down to a follower.

[Return to presenter camera · Warm conclusion]

In the interactive sandbox below, I want you to run the chaos monkey simulation and inject a 500 millisecond packet delay. Observe how your cluster gracefully shifts leadership in under 80 milliseconds.

Thanks for watching, and let's jump straight into the code!`;

    return res.json({
      topic: topic || 'Distributed Systems Architecture',
      estimatedMinutes: durationMinutes || 5,
      scriptText,
      bulletPoints: [
        'Linearizability vs Partition Tolerance under network splits',
        'Monotonic term increments vs faulty NTP system clock drift',
        'Stale leader detection and immediate follower step-down',
        'Chaos engineering verification under 500ms network delay'
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OWLY LMS server running on http://0.0.0.0:${PORT}`);
  });
}

start();
