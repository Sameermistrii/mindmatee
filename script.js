// Simple MindMate Script - Immediate Working Version

// Quiz Data
const QUIZ_QUESTIONS = [
    {
        key: 'goal',
        question: 'What outcome do you want in the next 6–12 months?',
        options: [
            'Get my first job/internship',
            'Switch career/domain',
            'Strengthen fundamentals',
            'Prepare for higher studies'
        ]
    },
    {
        key: 'strength',
        question: 'Which strength best describes you?',
        options: [
            'Logical problem-solving',
            'Communication and teaching',
            'Creative design and storytelling',
            'Hands-on building and tinkering'
        ]
    },
    {
        key: 'constraint',
        question: 'What constraint should we respect?',
        options: [
            'Low budget—prefer free resources',
            'Limited laptop/internet',
            'Only 5–7 hours weekly',
            'Need quick results (under 8 weeks)'
        ]
    },
    {
        key: 'learningStyle',
        question: 'How do you prefer to learn?',
        options: [
            'Video courses (NPTEL/SWAYAM/YouTube)',
            'Reading docs/books',
            'Project-first, learn by doing',
            'Mentorship/community support'
        ]
    },
    {
        key: 'weeklyTime',
        question: 'How much time can you spend weekly?',
        options: [
            '3–5 hours',
            '6–9 hours',
            '10–14 hours',
            '15+ hours'
        ]
    },
    {
        key: 'domain',
        question: 'Which domain interests you most?',
        options: [
            'Software Development / Web',
            'Data / AI / Analytics',
            'Design / UX',
            'Business / Marketing / Ops'
        ]
    }
];

// Global Variables
let currentQuestionIndex = 0;
let quizAnswers = {};

// Navigation Functions
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections including features
    document.querySelectorAll('section[id]').forEach(section => {
        section.classList.remove('active');
    });
    
    // Explicitly hide features section first
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.classList.remove('active');
        console.log('Features section explicitly hidden');
    }
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Special handling for hero section - show features too
    if (sectionName === 'hero') {
        console.log('Showing features section for hero');
        if (featuresSection) {
            featuresSection.classList.add('active');
            console.log('Features section shown for hero');
        }
    }
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quiz Functions
function startQuiz() {
    showSection('quiz-section');
    currentQuestionIndex = 0;
    quizAnswers = {};
    displayQuestion();
}

function displayQuestion() {
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;
    
    // Update progress display
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    const quizContent = document.getElementById('quiz-content');
    quizContent.innerHTML = `
        <div class="quiz-question">
            <h3>${question.question}</h3>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <div class="quiz-option ${quizAnswers[question.key] === option ? 'selected' : ''}" 
                         onclick="selectOption('${question.key}', '${option}')">
                        ${option}
                    </div>
                `).join('')}
            </div>
            <div class="quiz-navigation">
                ${currentQuestionIndex > 0 ? '<button onclick="previousQuestion()" class="btn btn-secondary">Previous</button>' : ''}
                <button onclick="nextQuestion()" class="btn btn-primary">
                    ${currentQuestionIndex === QUIZ_QUESTIONS.length - 1 ? 'Complete Quiz' : 'Next'}
                </button>
            </div>
        </div>
    `;
}

function selectOption(key, value) {
    quizAnswers[key] = value;
    
    // Update UI
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Find the clicked option and highlight it
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => {
        if (option.textContent.trim() === value) {
            option.classList.add('selected');
        }
    });
}

function nextQuestion() {
    if (!quizAnswers[QUIZ_QUESTIONS[currentQuestionIndex].key]) {
        alert('Please select an option before continuing.');
        return;
    }
    
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        completeQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function completeQuiz() {
    // Show roadmap
    showSection('roadmap-section');

    // Hide static grid while we generate a personalized roadmap
    const staticGrid = document.querySelector('#roadmap-section .careers-grid');
    if (staticGrid) staticGrid.style.display = 'none';

    // Show loading state
    const roadmapContent = document.getElementById('roadmap-content');
    if (roadmapContent) {
        roadmapContent.textContent = 'Generating your personalized roadmap...';
    }

    // Generate roadmap via AI
    generateRoadmapFromQuiz();
}

// Build a concise prompt for roadmap generation
function buildRoadmapPrompt(answers) {
    const goal = answers.goal || 'Not specified';
    const strength = answers.strength || 'Not specified';
    const constraint = answers.constraint || 'Not specified';
    const learningStyle = answers.learningStyle || 'Not specified';
    const weeklyTime = answers.weeklyTime || 'Not specified';
    const domain = answers.domain || 'Not specified';

    return [
        'Create a JSON-only roadmap (no prose, no markdown) following this schema:',
        '{',
        '  "targetRole": string,',
        '  "skills": string[],',
        '  "resources": string[],',
        '  "projects": string[],',
        '  "timeline": { "weeks1to4": string[], "weeks5to8": string[] },',
        '  "next7Days": string[]',
        '}',
        '',
        'Context: Indian student, rural/low-income; prioritize free resources and low-spec devices.',
        'Constraints:',
        `- Goal: ${goal}`,
        `- Strength: ${strength}`,
        `- Constraint: ${constraint}`,
        `- Learning style: ${learningStyle}`,
        `- Weekly time: ${weeklyTime}`,
        `- Domain interest: ${domain}`,
        'Guidelines:',
        '- Use specific, actionable bullets (Indian/low-cost resources preferred).',
        '- Keep items short; avoid generic advice.'
    ].join('\n');
}

// Utility: format arbitrary text into 4–8 concise bullet points
function formatToBullets(text) {
    if (!text || typeof text !== 'string') return '';
    const normalized = text.replace(/\r\n/g, '\n').replace(/\t+/g, ' ').trim();

    // If it already looks like a list, keep line breaks
    if (/^(\s*[•\-\d]+[\)\.\-]?\s+\S)/m.test(normalized)) {
        return normalized;
    }

    // Otherwise, split into sentences and bullet them
    const sentences = normalized
        .split(/(?<=[\.\!\?])\s+/)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 8);

    if (sentences.length === 0) return normalized;
    return sentences.map(s => `• ${s}`).join('\n');
}

// Robust JSON parse: try direct, then extract first {...} block
function safeParseJson(text) {
  if (!text || typeof text !== 'string') return null;
  try { return JSON.parse(text); } catch {}
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice);
    }
  } catch {}
  return null;
}

// Render a structured roadmap JSON into rich HTML
function renderRoadmap(roadmap) {
  const container = document.getElementById('roadmap-content');
  if (!container) return;

  // Defensive defaults
  const targetRole = roadmap?.targetRole || quizAnswers?.careerTrack || 'Your Target Role';
  const skills = Array.isArray(roadmap?.skills) ? roadmap.skills : [];
  const resources = Array.isArray(roadmap?.resources) ? roadmap.resources : [];
  const projects = Array.isArray(roadmap?.projects) ? roadmap.projects : [];
  const next7Days = Array.isArray(roadmap?.next7Days) ? roadmap.next7Days : [];
  const timeline = roadmap?.timeline || { weeks1to4: [], weeks5to8: [] };

  const list = arr => arr.map(item => `<li>${item}</li>`).join('');

  const html = `
    <div class="careers-grid">
      <div class="career-card">
        <div class="career-header">
          <div class="career-icon">🗺️</div>
          <div>
            <h3>${targetRole}</h3>
            <span class="career-match">Personalized Plan</span>
          </div>
        </div>
        <div>
          <h4>Key Skills</h4>
          <ul>${list(skills)}</ul>
        </div>
        <div style="margin-top: 0.75rem;">
          <h4>Free Resources</h4>
          <ul>${list(resources)}</ul>
        </div>
        <div style="margin-top: 0.75rem;">
          <h4>Projects</h4>
          <ul>${list(projects)}</ul>
        </div>
      </div>

      <div class="career-card">
        <div class="career-header">
          <div class="career-icon">⏱️</div>
          <div>
            <h3>Timeline</h3>
            <span class="career-match">Weeks</span>
          </div>
        </div>
        <div>
          <h4>Weeks 1–4</h4>
          <ul>${list(Array.isArray(timeline.weeks1to4) ? timeline.weeks1to4 : [])}</ul>
          <h4 style="margin-top: 0.75rem;">Weeks 5–8</h4>
          <ul>${list(Array.isArray(timeline.weeks5to8) ? timeline.weeks5to8 : [])}</ul>
        </div>
      </div>

      <div class="career-card">
        <div class="career-header">
          <div class="career-icon">✅</div>
          <div>
            <h3>Next 7 Days</h3>
            <span class="career-match">Action Items</span>
          </div>
        </div>
        <ul>${list(next7Days)}</ul>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function generateRoadmapFromQuiz() {
    try {
        const prompt = buildRoadmapPrompt(quizAnswers || {});
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider: 'gemini',
                model: 'gemini-1.5-flash',
                messages: [
                    { role: 'system', content: 'Return valid JSON only. No preamble. No backticks. Follow the provided schema exactly.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 400,
                temperature: 0.35
            })
        });

        const data = await response.json();
        const roadmapContent = document.getElementById('roadmap-content');
        const parsed = safeParseJson(data && data.response ? data.response : '');

        if (parsed) {
            renderRoadmap(parsed);
        } else {
            // Fallback to readable bullets
            if (roadmapContent) {
                const formatted = formatToBullets(data && data.response ? data.response : '');
                roadmapContent.textContent = formatted || 'Could not generate roadmap. Please try again.';
            }
        }
    } catch (err) {
        const roadmapContent = document.getElementById('roadmap-content');
        if (roadmapContent) {
            roadmapContent.textContent = [
                '• Clarify one career goal for this month',
                '• Learn 1 core skill (NPTEL/SWAYAM/YouTube)',
                '• Build 1 mini project to practice',
                '• Create a simple portfolio (GitHub/Google Drive)',
                '• Connect with 2 professionals on LinkedIn',
                '• Review progress weekly'
            ].join('\n');
        }
    }
}

// Journal Functions
function generateJournalPrompt() {
    const prompts = [
        'What small win today made you feel proud? Describe it in 3 lines.',
        'What’s one fear about your career? Write how you’ll handle it this week.',
        'List 3 free resources you can use this month and why they help you.',
        'Who can you message today for guidance or feedback? Draft the message.',
        'Write a thank you note to your future self for staying consistent.',
        'If you had 30 minutes free daily, how would you use it for your goal?'
    ];
    const p = prompts[Math.floor(Math.random() * prompts.length)];
    const node = document.getElementById('journal-prompt');
    if (node) node.textContent = p;
}

// Chat Functions
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai typing-indicator';
    typingDiv.innerHTML = `
        <strong>AI Mentor:</strong> 
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    document.getElementById('chat-messages').appendChild(typingDiv);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider: 'gemini',
                model: 'gemini-1.5-flash',
                messages: [
                    {
                        role: 'system',
                        content: [
                            'You are an empathetic Indian career mentor and wellness companion.',
                            'Always be supportive, culturally aware, and cost-sensitive (rural/low-income context).',
                            'Write crisp, specific bullets (3–6). Each bullet: action + resource/example + outcome.',
                            'Prefer Indian/low-cost resources: NPTEL, SWAYAM, NSDC, free YouTube channels.',
                            'Include a mini project idea when relevant. Avoid generic fluff. No long paragraphs.',
                            'Keep each bullet under 18 words.'
                        ].join('\n')
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 220,
                temperature: 0.35
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        typingDiv.remove();
        
        const formatted = formatToBullets(data.response);
        addChatMessage(formatted, 'ai');
        
        if (data.fallback) {
            addChatMessage('(Note: Using a temporary response while AI service initializes.)', 'ai');
        }
        
    } catch (error) {
        console.error('Error calling AI API:', error);
        typingDiv.remove();
        addChatMessage('Please try again in a moment. Meanwhile, ask for a roadmap or a 7‑day plan.', 'ai');
    }
}

function addChatMessage(content, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = sender === 'ai' ? formatToBullets(content) : content;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mobile navigation toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) {
        nav.classList.toggle('open');
    }
}

// Initialize the app immediately
document.addEventListener('DOMContentLoaded', function() {
    console.log('MindMate app initializing...');
    
    // Immediately hide loading screen and show main content
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    
    // Show hero section by default (this will also show features)
    showSection('hero');
    
    // Initialize quiz
    document.getElementById('total-questions').textContent = QUIZ_QUESTIONS.length;
    
    console.log('MindMate app initialized successfully!');
});
