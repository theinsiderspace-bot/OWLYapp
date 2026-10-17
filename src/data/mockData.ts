import { 
  User, 
  Instructor,
  Course, 
  EnrollmentProgress, 
  Transaction, 
  DiscussionThread, 
  Announcement, 
  TeacherApplication,
  GoogleMeetSession,
  EducatorBillingProfile,
  PayoutRecord,
  AIPricingRecommendation,
  AIEarningsForecast,
  HostedVideo,
  CloudStorageMetrics,
  AssignmentSubmission
} from '../types/lms';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-student-1',
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    role: 'student',
    avatarText: 'AM',
    title: 'Senior Software Engineer',
    bio: 'Passionate about building scalable distributed systems and mastering modern AI agent workflows.',
    enrolledCourseIds: ['course-1', 'course-2'],
    totalSpent: 428,
    joinedDate: 'Jan 15, 2026',
    status: 'active',
  },
  {
    id: 'user-teacher-1',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@mit.edu',
    password: 'teacher123',
    role: 'teacher',
    avatarText: 'EV',
    title: 'Principal Distributed Systems Architect & MIT Lecturer',
    bio: 'Former infrastructure lead at cloud hyper-scalers. Teaching robust consensus protocols, latency optimization, and microservice orchestration.',
    enrolledCourseIds: [],
    totalSpent: 0,
    joinedDate: 'Aug 10, 2025',
    status: 'active',
    teacherVerificationStatus: 'approved',
    teacherApplicationId: 'app-teacher-1',
  },
  {
    id: 'user-teacher-2',
    name: 'Prof. Julian Thorne',
    email: 'julian.thorne@oxford.ac.uk',
    password: 'oxford123',
    role: 'teacher',
    avatarText: 'JT',
    title: 'Associate Professor of Computer Science at Oxford',
    bio: 'Specializing in mechanical verification of distributed consensus safety in Coq and Lean 4.',
    enrolledCourseIds: [],
    totalSpent: 0,
    joinedDate: 'Apr 02, 2026',
    status: 'active',
    teacherVerificationStatus: 'pending_approval',
    teacherApplicationId: 'app-teacher-2',
  },
  {
    id: 'user-admin-theinsiderspace',
    name: 'Super Admin',
    email: 'theinsiderspace@gmail.com',
    password: '1542016',
    role: 'admin',
    avatarText: 'SA',
    title: 'Platform Dean & Super Administrator',
    bio: 'Super Admin with full platform management, faculty accreditation authority, and catalog governance.',
    enrolledCourseIds: [],
    totalSpent: 0,
    joinedDate: 'Oct 14, 2026',
    status: 'active',
  },
  {
    id: 'user-admin-1',
    name: 'Marcus Sterling',
    email: 'admin@aetherialms.io',
    password: 'admin',
    role: 'admin',
    avatarText: 'MS',
    title: 'Platform Dean & Head of Operations',
    bio: 'Overseeing course quality standards, instructor certifications, academic compliance, and marketplace operations.',
    enrolledCourseIds: [],
    totalSpent: 0,
    joinedDate: 'Jan 01, 2025',
    status: 'active',
  },
  {
    id: 'user-student-2',
    name: 'Sofia Lin',
    email: 'sofia.lin@techflow.io',
    role: 'student',
    avatarText: 'SL',
    title: 'Frontend Architect',
    bio: 'Building enterprise component libraries and accessibility test harnesses.',
    enrolledCourseIds: ['course-4'],
    totalSpent: 189,
    joinedDate: 'Feb 03, 2026',
    status: 'active',
  },
  {
    id: 'user-student-3',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@algotrade.co',
    role: 'student',
    avatarText: 'TM',
    title: 'Quantitative Research Analyst',
    bio: 'Statistical arbitrage, market microstructure, and high-frequency risk engineering.',
    enrolledCourseIds: ['course-3'],
    totalSpent: 349,
    joinedDate: 'Feb 19, 2026',
    status: 'active',
  },
  {
    id: 'user-student-4',
    name: 'Claire Dupont',
    email: 'claire.d@designsystems.eu',
    role: 'student',
    avatarText: 'CD',
    title: 'Lead Product Designer',
    bio: 'Bridging design tokens and production React components.',
    enrolledCourseIds: ['course-4', 'course-1'],
    totalSpent: 388,
    joinedDate: 'Mar 01, 2026',
    status: 'active',
  }
];

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    userId: 'user-teacher-1',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@mit.edu',
    avatarText: 'EV',
    academicTitle: 'Principal Distributed Systems Architect & MIT Lecturer',
    institutionOrCompany: 'Massachusetts Institute of Technology & CloudScale Labs',
    primaryDomain: 'Distributed Systems & Cloud Infrastructure',
    specialties: ['Consensus Protocols (Raft/Paxos)', 'CRDTs & Eventual Consistency', 'Fault-Tolerant Microservices', 'OpenTelemetry & Tracing'],
    bio: 'Former infrastructure lead at cloud hyper-scalers. Over 15 years engineering mission-critical consensus engines and low-latency storage fabrics. Has published 24+ ACM/IEEE papers on asynchronous fault-tolerance.',
    credentialsSummary: 'Ph.D. in Computer Science from MIT; M.S. in Electrical Engineering & Computer Science from Stanford.',
    portfolioUrl: 'https://scholar.google.com/citations?user=elenavance_mit',
    verificationStatus: 'approved',
    rating: 4.96,
    reviewCount: 382,
    studentCount: 1420,
    courseIds: ['course-1', 'course-2', 'course-3', 'course-5', 'course-6', 'course-7'],
    officeHoursSchedule: 'Tuesdays & Thursdays, 16:00 - 18:00 UTC (via Google Meet)',
    featured: true,
    hIndex: 32,
    publicationsCount: 28,
    joinedDate: 'Aug 10, 2025'
  },
  {
    id: 'inst-2',
    userId: 'user-teacher-2',
    name: 'Prof. Julian Thorne',
    email: 'julian.thorne@oxford.ac.uk',
    avatarText: 'JT',
    academicTitle: 'Associate Professor of Formal Methods at Oxford',
    institutionOrCompany: 'University of Oxford, Department of Computer Science',
    primaryDomain: 'Formal Verification & Program Correctness',
    specialties: ['Lean 4 Theorem Prover', 'Coq Proof Assistant', 'Verified Consensus Safety', 'Memory-Safe Type Systems'],
    bio: 'Dedicated to closing the gap between mathematical proofs and executable software. Specializes in formally verifying state-machine replication protocols and kernel-level memory safety.',
    credentialsSummary: 'D.Phil. in Formal Methods from Oxford; Fellow of the Turing Institute.',
    portfolioUrl: 'https://thorne-oxford-research.ac.uk',
    verificationStatus: 'pending_approval',
    rating: 4.88,
    reviewCount: 94,
    studentCount: 460,
    courseIds: [],
    officeHoursSchedule: 'Mondays & Wednesdays, 14:00 - 16:00 GMT',
    featured: false,
    hIndex: 19,
    publicationsCount: 17,
    joinedDate: 'Apr 02, 2026'
  },
  {
    id: 'inst-3',
    userId: 'user-teacher-3',
    name: 'Dr. Maya Lin-Siddiqui',
    email: 'maya.siddiqui@stanford.edu',
    avatarText: 'MS',
    academicTitle: 'Director of Applied Autonomous Intelligence & Stanford Fellow',
    institutionOrCompany: 'Stanford AI Research Laboratory & NeuralScale Foundation',
    primaryDomain: 'Artificial Intelligence & Large Agent Models',
    specialties: ['Agentic Workflows & Multi-Agent Swarms', 'Context Compression & Vector Indexing', 'DSPy & Structured Generation', 'Reinforcement Learning from AI Feedback'],
    bio: 'Pioneered early research on recursive reasoning loops and agentic code synthesis. Advises enterprise research labs on safe deployment of autonomous tool-use agents and high-throughput inference caching.',
    credentialsSummary: 'Ph.D. in Computer Science from Stanford University; B.S. in Mathematics from Caltech.',
    portfolioUrl: 'https://ai.stanford.edu/~msiddiqui',
    verificationStatus: 'approved',
    rating: 4.98,
    reviewCount: 512,
    studentCount: 2180,
    courseIds: ['course-4'],
    officeHoursSchedule: 'Wednesdays & Fridays, 18:00 - 20:00 PST',
    featured: true,
    hIndex: 38,
    publicationsCount: 41,
    joinedDate: 'Oct 01, 2025'
  },
  {
    id: 'inst-4',
    userId: 'user-teacher-4',
    name: 'Dr. Aris Thorne',
    email: 'aris.thorne@cambridge.ac.uk',
    avatarText: 'AT',
    academicTitle: 'Principal Investigator in Synthetic Biology & CRISPR Engineering',
    institutionOrCompany: 'University of Cambridge, Wellcome Genome Campus',
    primaryDomain: 'Synthetic Genomics & Molecular Engineering',
    specialties: ['CRISPR-Cas12/Cas13 Targeting', 'Enzymatic DNA Synthesis', 'Metabolic Pathway Optimization', 'Computational Protein Folding'],
    bio: 'Leading investigator in targeted gene editing and synthetic regulatory circuits. Built automated high-throughput screening platforms for epigenetic silencing and molecular therapeutics.',
    credentialsSummary: 'Ph.D. in Molecular Biology from Cambridge; Postdoctoral Fellow at Broad Institute of MIT and Harvard.',
    portfolioUrl: 'https://cambridge.ac.uk/synthetic-genomics/thorne',
    verificationStatus: 'approved',
    rating: 4.93,
    reviewCount: 275,
    studentCount: 1120,
    courseIds: [],
    officeHoursSchedule: 'Thursdays, 13:00 - 15:00 GMT (Google Meet Bio Lab)',
    featured: true,
    hIndex: 29,
    publicationsCount: 33,
    joinedDate: 'Nov 14, 2025'
  },
  {
    id: 'inst-5',
    userId: 'user-teacher-5',
    name: 'Prof. David K. Ben-Ami',
    email: 'benami@princeton.edu',
    avatarText: 'DB',
    academicTitle: 'Professor of Quantum Information & Chair of Cryptography',
    institutionOrCompany: 'Princeton University & Institute for Advanced Study',
    primaryDomain: 'Quantum Computing & Post-Quantum Cryptography',
    specialties: ['Lattice-Based Cryptography', 'Shor & Grover Algorithm Implementations', 'Quantum Error Correction', 'Zero-Knowledge Proof Systems'],
    bio: 'Recognized for pioneering contributions to post-quantum key exchange algorithms and fault-tolerant surface codes. Authored the standard textbook on applied quantum circuits.',
    credentialsSummary: 'Ph.D. in Theoretical Physics from Princeton University; ACM Fellow.',
    portfolioUrl: 'https://princeton.edu/~benami/quantum',
    verificationStatus: 'approved',
    rating: 4.95,
    reviewCount: 310,
    studentCount: 980,
    courseIds: [],
    officeHoursSchedule: 'Tuesdays, 15:00 - 17:00 EST',
    featured: false,
    hIndex: 44,
    publicationsCount: 56,
    joinedDate: 'Sep 20, 2025'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    slug: 'distributed-systems-cloud-architecture',
    title: 'Distributed Systems & Cloud Architecture at Scale',
    subtitle: 'Master consensus algorithms, partition tolerance, gRPC telemetry, and multi-region resilience.',
    description: 'An exhaustive, industry-grade deep dive into designing fault-tolerant distributed backends. From Raft and Paxos consensus models to zero-downtime database sharding and distributed tracing with OpenTelemetry, build the foundational mental models required to operate tier-1 cloud systems.',
    category: 'Engineering',
    level: 'Advanced',
    price: 249,
    originalPrice: 329,
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    instructorTitle: 'Principal Systems Architect & MIT Lecturer',
    instructorBio: '15+ years engineering fault-tolerant cloud backends. Former tech lead for global multi-region datastores.',
    rating: 4.94,
    reviewCount: 382,
    studentCount: 1420,
    durationHours: 18.5,
    updatedDate: 'March 2026',
    featured: true,
    status: 'published',
    theme: {
      accentColor: '#0284C7',
      gradientFrom: 'from-sky-950',
      gradientTo: 'to-slate-900',
      icon: 'server',
    },
    learningObjectives: [
      'Deconstruct Raft consensus protocol, leader election, and log compaction under network partitions',
      'Architect multi-region active-active databases with CRDTs and deterministic conflict resolution',
      'Implement backpressure pipelines and bulkhead patterns to resist cascading failures',
      'Instrument end-to-end distributed tracing using OpenTelemetry and p99 latency SLOs'
    ],
    prerequisites: [
      'Proficiency in Go, Rust, or modern TypeScript/Node.js',
      'Solid understanding of TCP/IP, sockets, and basic concurrency primitives'
    ],
    modules: [
      {
        id: 'mod-1-1',
        title: 'Module 1: Foundations of Distributed Consistency',
        description: 'Explore network asynchronous models, logical clocks, and the boundaries of the CAP theorem.',
        lessons: [
          {
            id: 'les-1-1-1',
            title: '1.1 Physical Time vs. Lamport Logical Clocks',
            durationMinutes: 24,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            contentMarkdown: `### Physical vs Logical Time in Asynchronous Networks

In distributed systems, physical wall-clock time is inherently unreliable due to quartz oscillator drift, NTP synchronization delays, and variable network latency.

#### Key Takeaways:
1. **NTP Jitter**: Never rely on system clocks for strict ordering across multiple nodes.
2. **Lamport Timestamps**: Define a partial ordering: If event A caused event B, then C(A) < C(B).
3. **Vector Clocks**: Capture true concurrent causality and identify divergence between divergent replicas.`,
            resources: [
              { id: 'res-1', name: 'Logical_Clocks_Whitepaper.pdf', fileSize: '1.8 MB', type: 'PDF' },
              { id: 'res-2', name: 'Lamport_Implementation_Go.zip', fileSize: '420 KB', type: 'Source Code' }
            ]
          },
          {
            id: 'les-1-1-2',
            title: '1.2 The Raft Consensus Protocol: Leader Election & Log Replication',
            durationMinutes: 38,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            contentMarkdown: `### The Mechanics of Raft Consensus

Raft decomposes the consensus problem into three distinct sub-problems:
- Leader Election: Heartbeat timeouts, election randomized backoff, candidate state transitions.
- Log Replication: Two-phase commit replication, append entries RPC invariants.
- Safety: Leaders only commit entries from their current term, guaranteeing election safety.`,
            resources: [
              { id: 'res-3', name: 'Raft_StateMachine_Diagrams.pdf', fileSize: '2.4 MB', type: 'PDF' }
            ]
          },
          {
            id: 'les-1-1-3',
            title: '1.3 Knowledge Assessment: Consistency Models & Raft',
            durationMinutes: 15,
            type: 'quiz',
            quizQuestions: [
              {
                id: 'q1-1',
                question: 'Why are randomized election timeouts used in the Raft consensus protocol?',
                options: [
                  'To reduce CPU usage on follower nodes',
                  'To avoid split-vote deadlocks where multiple candidates start elections simultaneously',
                  'To ensure log compaction runs predictably at off-peak hours',
                  'To synchronize logical clocks across nodes without NTP'
                ],
                correctAnswerIndex: 1,
                explanation: 'Randomized election timeouts (e.g., 150ms-300ms) ensure that one node times out first and becomes candidate before others, effectively preventing split-vote scenarios.'
              },
              {
                id: 'q1-2',
                question: 'In a 5-node Raft cluster, what is the maximum number of simultaneous node failures the cluster can tolerate while remaining available for writes?',
                options: [
                  '1 node',
                  '2 nodes',
                  '3 nodes',
                  '4 nodes'
                ],
                correctAnswerIndex: 1,
                explanation: 'A quorum requires a majority: floor(N/2) + 1. For N=5, quorum is 3. Thus, at most 2 nodes can fail while 3 remain to form a majority.'
              }
            ]
          }
        ]
      },
      {
        id: 'mod-1-2',
        title: 'Module 2: Resiliency, Partition Tolerance & Failure Modes',
        description: 'Circuit breakers, bulkhead isolation, and rate-limiting patterns at scale.',
        lessons: [
          {
            id: 'les-1-2-1',
            title: '2.1 Cascading Failures and the Bulkhead Pattern',
            durationMinutes: 28,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            contentMarkdown: `### Preventing Cascading Retries

When downstream services experience high latency, upstream clients often initiate exponential retries. Without jitter or backoff, this creates a retry storm that permanently crushes recovering nodes.

#### Mitigation Strategies:
- Client Exponential Backoff with Decorrelated Jitter
- Token Bucket Rate Limiting per Tenant
- Circuit Breaker Trip Thresholds (Closed -> Open -> Half-Open)`,
            resources: [
              { id: 'res-4', name: 'Resiliency_Patterns_Handbook.pdf', fileSize: '3.1 MB', type: 'PDF' }
            ]
          },
          {
            id: 'les-1-2-2',
            title: '2.2 Deep Dive: Distributed Tracing with OpenTelemetry',
            durationMinutes: 32,
            type: 'article',
            contentMarkdown: `### Distributed Tracing Context Propagation

In microservice architectures, requests cross dozens of boundaries. Trace context must be propagated through HTTP headers (traceparent) and gRPC metadata.

Format: version - trace_id - parent_id - trace_flags
Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01

#### Metric Sinks & Sampling Strategies:
- Head-based sampling: Cheap, decides at origin (e.g. sample 5% of traffic).
- Tail-based sampling: High observability fidelity, buffers traces and keeps all traces with errors or p99 duration exceeding 800ms.`,
            resources: [
              { id: 'res-5', name: 'OpenTelemetry_Collector_Config.yaml', fileSize: '18 KB', type: 'Config' }
            ]
          }
        ]
      },
      {
        id: 'mod-1-3',
        title: 'Module 3: Global Multi-Region Data Pipelines',
        description: 'Active-Active replication, read replicas, and CRDT synchronization.',
        lessons: [
          {
            id: 'les-1-3-1',
            title: '3.1 Conflict-Free Replicated Data Types (CRDTs)',
            durationMinutes: 35,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            contentMarkdown: `### State-based vs Operation-based CRDTs

CRDTs allow distributed replicas to accept concurrent mutations without centralized locking. By ensuring join semi-lattice mathematical properties (Commutative, Associative, Idempotent), all replicas converge identically regardless of delivery order.`,
            resources: [
              { id: 'res-6', name: 'CRDT_Formal_Proofs.pdf', fileSize: '4.2 MB', type: 'PDF' }
            ]
          },
          {
            id: 'les-1-3-2',
            title: '3.2 Capstone Final Exam: Architecting for 99.999% SLA',
            durationMinutes: 20,
            type: 'quiz',
            quizQuestions: [
              {
                id: 'q1-3',
                question: 'Which property must a join function in a state-based CRDT satisfy to guarantee eventual consistency across arbitrary message re-ordering?',
                options: [
                  'Linearizability, Serializability, and Atomicity',
                  'Commutativity, Associativity, and Idempotency',
                  'Strict Monotonic Clock Alignment',
                  'Two-Phase Lock Step Synchronization'
                ],
                correctAnswerIndex: 1,
                explanation: 'A semi-lattice join operator must be associative (grouping does not matter), commutative (order does not matter), and idempotent (duplicate messages have no additional effect).'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    slug: 'generative-ai-production-engineering',
    title: 'Generative AI Engineering: Production LLMs & Autonomous Agents',
    subtitle: 'Build enterprise-grade AI systems with structured outputs, vector retrieval, evaluation pipelines, and tool grounding.',
    description: 'Transition from prototype prompts to robust, deterministic AI infrastructure. Learn semantic caching, hybrid BM25 + dense embedding retrieval, multi-agent orchestrations, guardrails, and automated LLM-as-a-judge evaluation frameworks.',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    price: 179,
    originalPrice: 249,
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    instructorTitle: 'Principal Systems Architect & MIT Lecturer',
    instructorBio: 'Pioneered early LLM tool-calling architectures and high-throughput semantic caching engines.',
    rating: 4.97,
    reviewCount: 512,
    studentCount: 2180,
    durationHours: 14.0,
    updatedDate: 'February 2026',
    featured: true,
    status: 'published',
    theme: {
      accentColor: '#6366F1',
      gradientFrom: 'from-indigo-950',
      gradientTo: 'to-slate-900',
      icon: 'cpu',
    },
    learningObjectives: [
      'Design deterministic structured JSON schema extraction with guaranteed compile-time validation',
      'Construct production RAG architectures with reciprocal rank fusion (RRF) and context compression',
      'Implement multi-agent supervisor patterns with stateful execution loops',
      'Establish continuous evaluation benchmarks measuring hallucination rate, groundedness, and latency'
    ],
    prerequisites: [
      'Familiarity with Python or TypeScript',
      'Basic knowledge of REST APIs and embedding spaces'
    ],
    modules: [
      {
        id: 'mod-2-1',
        title: 'Module 1: Structured Inference & Deterministic Outputs',
        description: 'Enforcing schemas, function calling mechanics, and token budget management.',
        lessons: [
          {
            id: 'les-2-1-1',
            title: '1.1 Schema-Guided Decoding & JSON Enforcers',
            durationMinutes: 26,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            contentMarkdown: `### Guaranteeing Valid JSON at Inference Time

Unconstrained text models frequently emit markdown backticks or malformed JSON keys. Modern engines use constrained grammar decoding (CFG / JSON Schema masks at logit generation).

#### Production Best Practices:
1. Pass exact Zod / Pydantic schemas in the system prompt and tool definitions.
2. Monitor output token exhaustion to ensure JSON braces close cleanly.
3. Validate responses prior to executing downstream database side effects.`,
            resources: [
              { id: 'res-2-1', name: 'Zod_Agent_Schemas.ts', fileSize: '24 KB', type: 'Code' }
            ]
          },
          {
            id: 'les-2-1-2',
            title: '1.2 Hands-On: Function Calling & External API Tool Dispatching',
            durationMinutes: 34,
            type: 'article',
            contentMarkdown: `### The Function Calling Execution Loop

Flow:
User Query -> LLM selects Tool & generates Arguments -> Application executes Tool -> Tool Output sent to LLM -> Final Synthesized Answer

Critical security safeguard: Never allow the LLM to execute write or mutation operations without human confirmation or strict scope barriers.`,
            resources: [
              { id: 'res-2-2', name: 'Agent_Tool_Runtime_Guide.pdf', fileSize: '1.5 MB', type: 'PDF' }
            ]
          },
          {
            id: 'les-2-1-3',
            title: '1.3 Assessment: Function Calling & Output Reliability',
            durationMinutes: 12,
            type: 'quiz',
            quizQuestions: [
              {
                id: 'q2-1',
                question: 'What is the primary advantage of constrained grammar logit masking over naive retry parsing for structured JSON generation?',
                options: [
                  'It reduces embedding dimension size by 50%',
                  'It guarantees that every emitted token is syntactically valid according to the schema without wasting tokens on retries',
                  'It eliminates the need for system prompts entirely',
                  'It encrypts the payload over the wire'
                ],
                correctAnswerIndex: 1,
                explanation: 'Constrained grammar decoding masks out invalid next tokens at the probability layer, ensuring 100% syntactically correct schema generation on the very first pass.'
              }
            ]
          }
        ]
      },
      {
        id: 'mod-2-2',
        title: 'Module 2: Advanced Retrieval Augmented Generation (RAG)',
        description: 'Hybrid search, re-ranking models, and chunking strategy optimizations.',
        lessons: [
          {
            id: 'les-2-2-1',
            title: '2.1 Hybrid Search: Combining Dense Embeddings with BM25 Lexical Matching',
            durationMinutes: 30,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            contentMarkdown: `### Why Dense Embeddings Alone Fail in Enterprise RAG

Vector embeddings excel at semantic similarity ("car" matches "automobile"), but frequently drop exact product codes, SKU numbers, error messages, and unique personal names.

#### Reciprocal Rank Fusion (RRF):
RRF score = sum over methods (1 / (k + rank))
Where k=60 dampens the impact of high-ranking outliers from either the lexical or vector search rank list.`,
            resources: [
              { id: 'res-2-3', name: 'RRF_Hybrid_Search_Notebook.ipynb', fileSize: '2.1 MB', type: 'Jupyter' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    slug: 'algorithmic-trading-quantitative-modeling',
    title: 'Algorithmic Trading & Quantitative Portfolio Modeling',
    subtitle: 'Design systematic alpha strategies, backtest with historical microstructure data, and engineer automated risk limits.',
    description: 'Learn modern quantitative portfolio management from financial engineers. Build statistical arbitrage engines, implement Mean-Variance & Black-Litterman optimization, measure Value-at-Risk (VaR), and avoid look-ahead bias in high-fidelity simulations.',
    category: 'Finance & Trading',
    level: 'Intermediate',
    price: 349,
    originalPrice: 449,
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    instructorTitle: 'Principal Systems Architect & MIT Lecturer',
    instructorBio: 'Consultant for quantitative funds on low-latency market feeds and high-throughput order execution systems.',
    rating: 4.89,
    reviewCount: 240,
    studentCount: 890,
    durationHours: 16.0,
    updatedDate: 'January 2026',
    featured: false,
    status: 'published',
    theme: {
      accentColor: '#10B981',
      gradientFrom: 'from-emerald-950',
      gradientTo: 'to-slate-900',
      icon: 'trending-up',
    },
    learningObjectives: [
      'Formulate statistical arbitrage and cointegration pairs trading models',
      'Execute walk-forward backtests with realistic slippage, commission, and latency friction',
      'Calculate Value-at-Risk (VaR), Conditional VaR, and maximum drawdown metrics',
      'Optimize multi-asset allocations using Black-Litterman Bayesian frameworks'
    ],
    prerequisites: [
      'Linear algebra, probability, and intermediate statistics',
      'Python or scientific computing experience (NumPy, pandas)'
    ],
    modules: [
      {
        id: 'mod-3-1',
        title: 'Module 1: Market Microstructure & Order Book Dynamics',
        description: 'Level 2 limit order books, bid-ask spreads, and execution slippage modeling.',
        lessons: [
          {
            id: 'les-3-1-1',
            title: '1.1 The Limit Order Book & Liquidity Curves',
            durationMinutes: 32,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            contentMarkdown: `### Order Book Mechanics

Every trade matches passive limit orders against aggressive market orders. Analyzing order flow toxicity (VPIN) allows systematic algorithms to avoid adverse selection when institutional orders cross the spread.`,
            resources: [
              { id: 'res-3-1', name: 'Order_Book_Simulator.py', fileSize: '48 KB', type: 'Python' }
            ]
          },
          {
            id: 'les-3-1-2',
            title: '1.2 Quiz: Microstructure & Slippage Analysis',
            durationMinutes: 15,
            type: 'quiz',
            quizQuestions: [
              {
                id: 'q3-1',
                question: 'What is "adverse selection" in the context of quantitative market making?',
                options: [
                  'Selecting an exchange that charges higher API fees',
                  'Getting filled primarily by informed traders right before the price moves against your quote',
                  'Suffering hardware packet loss during volatile news events',
                  'Failing to backtest on out-of-sample data'
                ],
                correctAnswerIndex: 1,
                explanation: 'Adverse selection occurs when a market maker gets filled by counterparties who have superior information, causing the position to immediately take paper losses.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-4',
    slug: 'production-design-systems-engineering',
    title: 'Production Design Systems: Accessible UI & Token Architecture',
    subtitle: 'Scale cross-platform component architectures, design tokens, micro-interactions, and WCAG AAA compliance.',
    description: 'Transform chaotic component sprawl into an automated, multi-brand design system. Learn token transformation pipelines (Style Dictionary), composable primitives, fluid responsive type scales, and keyboard accessibility testing.',
    category: 'Design Systems',
    level: 'All Levels',
    price: 189,
    originalPrice: 229,
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    instructorTitle: 'Principal Systems Architect & MIT Lecturer',
    instructorBio: 'Advocate of rigorous UI engineering, zero-drift design tokens, and universal accessibility.',
    rating: 4.96,
    reviewCount: 429,
    studentCount: 1650,
    durationHours: 12.0,
    updatedDate: 'March 2026',
    featured: false,
    status: 'published',
    theme: {
      accentColor: '#F59E0B',
      gradientFrom: 'from-amber-950',
      gradientTo: 'to-slate-900',
      icon: 'layout',
    },
    learningObjectives: [
      'Architect multi-tier design tokens (Global, Semantic, Component-level)',
      'Construct polymorphic UI primitives with zero DOM redundancy',
      'Automate WCAG 2.2 AA and AAA contrast and keyboard focus traps',
      'Build living documentation and automated visual regression test suites'
    ],
    prerequisites: [
      'Modern HTML, CSS/Tailwind, and React or modern component framework',
      'Basic familiarity with Figma or design tools'
    ],
    modules: [
      {
        id: 'mod-4-1',
        title: 'Module 1: Semantic Design Tokens & Architecture',
        description: 'Separating raw hex values from intent-driven design tokens.',
        lessons: [
          {
            id: 'les-4-1-1',
            title: '1.1 The Three Tiers of Design Tokens',
            durationMinutes: 28,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            contentMarkdown: `### The Three-Tier Token Architecture

1. Global Tokens (Primitives): Pure descriptive values, e.g. color-blue-500 = #3b82f6.
2. Semantic Tokens (Contextual): Express intent, e.g. color-surface-action-primary.
3. Component Tokens (Scoped): Scoped to specific widgets, e.g. button-primary-bg.

This decoupling allows instant theme swaps (Dark Mode, High Contrast, Brand Theming) without touching a single component file!`,
            resources: [
              { id: 'res-4-1', name: 'Design_Tokens_JSON_Schema.json', fileSize: '12 KB', type: 'JSON' }
            ]
          },
          {
            id: 'les-4-1-2',
            title: '1.2 Accessible Keyboard Focus Management',
            durationMinutes: 24,
            type: 'article',
            contentMarkdown: `### Managing Focus Rings & Modals

Never suppress focus without providing a crisp focus-visible alternative. For modal dialogs and drawers, trap focus within the container and return focus to the triggering element upon closure.`,
            resources: [
              { id: 'res-4-2', name: 'FocusTrap_Hook.tsx', fileSize: '8 KB', type: 'Code' }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_ENROLLMENTS: Record<string, EnrollmentProgress> = {
  // Key format: user-student-1_course-1
  'user-student-1_course-1': {
    courseId: 'course-1',
    userId: 'user-student-1',
    enrolledAt: '2026-01-20T10:30:00Z',
    completedLessonIds: ['les-1-1-1', 'les-1-1-2', 'les-1-1-3', 'les-1-2-1'],
    lastAccessedLessonId: 'les-1-2-2',
    quizScores: {
      'les-1-1-3': 100,
    },
    userNotes: {
      'les-1-1-1': 'Remember: Lamport clocks only establish partial order. Vector clocks required for detecting concurrent branch conflicts.',
      'les-1-1-2': 'Election timeout randomization: keep between 150-300ms in low latency networks.'
    }
  },
  'user-student-1_course-2': {
    courseId: 'course-2',
    userId: 'user-student-1',
    enrolledAt: '2026-02-14T14:15:00Z',
    completedLessonIds: ['les-2-1-1', 'les-2-1-2', 'les-2-1-3', 'les-2-2-1'],
    lastAccessedLessonId: 'les-2-2-1',
    quizScores: {
      'les-2-1-3': 100,
    },
    userNotes: {
      'les-2-1-1': 'Constrained grammar decoding is crucial for mission-critical SQL / JSON generation.'
    },
    certificateIssued: {
      issueDate: 'March 10, 2026',
      credentialId: 'ATH-GENAI-98420-ALX',
      recipientName: 'Alex Mercer'
    }
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1001',
    invoiceNumber: 'INV-2026-0081',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    userId: 'user-student-1',
    userName: 'Alex Mercer',
    userEmail: 'alex.mercer@example.com',
    amount: 249,
    originalAmount: 249,
    paymentMethod: 'card',
    cardLast4: '4242',
    status: 'completed',
    createdAt: '2026-01-20T10:30:00Z'
  },
  {
    id: 'tx-1002',
    invoiceNumber: 'INV-2026-0142',
    courseId: 'course-2',
    courseTitle: 'Generative AI Engineering: Production LLMs & Autonomous Agents',
    userId: 'user-student-1',
    userName: 'Alex Mercer',
    userEmail: 'alex.mercer@example.com',
    amount: 179,
    originalAmount: 179,
    paymentMethod: 'applepay',
    status: 'completed',
    createdAt: '2026-02-14T14:15:00Z'
  },
  {
    id: 'tx-1003',
    invoiceNumber: 'INV-2026-0198',
    courseId: 'course-4',
    courseTitle: 'Production Design Systems: Accessible UI & Token Architecture',
    userId: 'user-student-2',
    userName: 'Sofia Lin',
    userEmail: 'sofia.lin@techflow.io',
    amount: 189,
    originalAmount: 189,
    paymentMethod: 'card',
    cardLast4: '8819',
    status: 'completed',
    createdAt: '2026-02-28T09:45:00Z'
  },
  {
    id: 'tx-1004',
    invoiceNumber: 'INV-2026-0220',
    courseId: 'course-3',
    courseTitle: 'Algorithmic Trading & Quantitative Portfolio Modeling',
    userId: 'user-student-3',
    userName: 'Tariq Al-Mansoor',
    userEmail: 'tariq.mansoor@algotrade.co',
    amount: 349,
    originalAmount: 349,
    paymentMethod: 'bank',
    status: 'completed',
    createdAt: '2026-03-04T16:20:00Z'
  }
];

export const INITIAL_DISCUSSIONS: DiscussionThread[] = [
  {
    id: 'disc-1',
    courseId: 'course-1',
    lessonId: 'les-1-1-1',
    lessonTitle: '1.1 Physical Time vs. Lamport Logical Clocks',
    authorId: 'user-student-1',
    authorName: 'Alex Mercer',
    authorRole: 'student',
    title: 'How do vector clocks handle dynamic node churn in autoscaling groups?',
    content: 'In our Kubernetes cluster, worker pods spin up and terminate continuously. When using vector clocks, does the vector size grow indefinitely with each new node, or is there a standard garbage collection protocol for dead node IDs?',
    createdAt: '2 days ago',
    isAnswered: true,
    isPinned: true,
    replies: [
      {
        id: 'reply-1-1',
        authorId: 'user-teacher-1',
        authorName: 'Dr. Elena Vance',
        authorRole: 'teacher',
        content: 'Great architectural question, Alex! In unbounded dynamic environments, naive vector clocks suffer from vector bloat. Production systems (like Riak or Dynamo derivatives) solve this using Dotted Version Vectors (DVVs) combined with a bounded epoch prune or TTL garbage collection for nodes that have remained quiescent for longer than the maximum network partition window.',
        createdAt: '1 day ago',
        isInstructorEndorsed: true
      },
      {
        id: 'reply-1-2',
        authorId: 'user-student-2',
        authorName: 'Sofia Lin',
        authorRole: 'student',
        content: 'We ran into this exact issue at my company! Setting an epoch ID based on deployment releases helped us reset the vector keys cleanly.',
        createdAt: '18 hours ago',
        isInstructorEndorsed: false
      }
    ]
  },
  {
    id: 'disc-2',
    courseId: 'course-1',
    lessonId: 'les-1-2-1',
    lessonTitle: '2.1 Cascading Failures and the Bulkhead Pattern',
    authorId: 'user-student-4',
    authorName: 'Claire Dupont',
    authorRole: 'student',
    title: 'Recommended circuit breaker sensitivity for downstream databases?',
    content: 'When setting error thresholds for our Postgres read replicas, what is considered an industry-standard error rate percentage before tripping the circuit breaker open?',
    createdAt: '4 days ago',
    isAnswered: true,
    isPinned: false,
    replies: [
      {
        id: 'reply-2-1',
        authorId: 'user-teacher-1',
        authorName: 'Dr. Elena Vance',
        authorRole: 'teacher',
        content: 'Typically 50% failures over a rolling window of 20 requests with a 5-second sleep before half-open probe testing. But always differentiate between 500 server internal errors and client-side 400 Bad Request queries!',
        createdAt: '3 days ago',
        isInstructorEndorsed: true
      }
    ]
  },
  {
    id: 'disc-3',
    courseId: 'course-2',
    lessonId: 'les-2-1-1',
    lessonTitle: '1.1 Schema-Guided Decoding & JSON Enforcers',
    authorId: 'user-student-1',
    authorName: 'Alex Mercer',
    authorRole: 'student',
    title: 'Logit bias vs BNF grammar masks performance comparison',
    content: 'Does applying an out-of-vocabulary mask incur latency overhead on large token sequences compared to free generation?',
    createdAt: '5 days ago',
    isAnswered: true,
    isPinned: false,
    replies: [
      {
        id: 'reply-3-1',
        authorId: 'user-teacher-1',
        authorName: 'Dr. Elena Vance',
        authorRole: 'teacher',
        content: 'Modern engines pre-compile the BNF grammar into an incremental pushdown automaton or regex DFA during token preparation. The per-token mask calculation is sub-millisecond and overwhelmingly saved by zero need for retries.',
        createdAt: '4 days ago',
        isInstructorEndorsed: true
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    teacherId: 'user-teacher-1',
    teacherName: 'Dr. Elena Vance',
    title: 'Live Architecture Review & Office Hours: Raft Partitions Case Study',
    content: 'This Thursday at 17:00 UTC, we will host a deep-dive walkthrough analyzing a real-world multi-region partition event that hit an active-active datastore. Bring your questions to the discussion board beforehand!',
    createdAt: 'March 18, 2026'
  },
  {
    id: 'ann-2',
    courseId: 'course-2',
    courseTitle: 'Generative AI Engineering: Production LLMs & Autonomous Agents',
    teacherId: 'user-teacher-1',
    teacherName: 'Dr. Elena Vance',
    title: 'New Module Update: Multimodal Tool Grounding and Audio Streaming',
    content: 'We have just appended extra code samples to Module 2 covering streaming real-time audio feeds and bidirectional function call verification.',
    createdAt: 'March 14, 2026'
  }
];

export const INITIAL_TEACHER_APPLICATIONS: TeacherApplication[] = [
  {
    id: 'app-teacher-1',
    userId: 'user-teacher-1',
    applicantName: 'Dr. Elena Vance',
    applicantEmail: 'elena.vance@mit.edu',
    academicTitle: 'Principal Distributed Systems Architect & MIT Lecturer',
    institutionOrCompany: 'Massachusetts Institute of Technology',
    primaryDomain: 'Engineering & Cloud Infrastructure',
    bio: '15+ years engineering fault-tolerant cloud backends. Former tech lead for global multi-region datastores.',
    portfolioUrl: 'https://github.com/elena-vance-systems',
    credentialsSummary: 'PhD in Computer Science (MIT, 2014). Author of 8 IEEE papers on consensus protocols.',
    proposedCourseTopic: 'Distributed Systems & Cloud Architecture at Scale',
    submittedAt: '2025-08-08T10:00:00Z',
    status: 'approved',
    reviewedAt: '2025-08-10T14:30:00Z',
    reviewedBy: 'Marcus Sterling',
    reviewNotes: 'Verified MIT faculty standing and published research papers. Approved for full curriculum creation.'
  },
  {
    id: 'app-teacher-2',
    userId: 'user-teacher-2',
    applicantName: 'Prof. Julian Thorne',
    applicantEmail: 'julian.thorne@oxford.ac.uk',
    academicTitle: 'Associate Professor of Computer Science at Oxford',
    institutionOrCompany: 'University of Oxford, Department of Computer Science',
    primaryDomain: 'Formal Methods & Cryptography',
    bio: 'Specializing in mechanical verification of distributed consensus safety in Coq and Lean 4.',
    portfolioUrl: 'https://github.com/jthorne-oxford-formal',
    credentialsSummary: 'DPhil in Computer Science (Oxford). Fellow of the British Computer Society. 12 publications in POPL and CAV.',
    proposedCourseTopic: 'Formal Methods & Interactive Theorem Proving for Mission-Critical Infrastructure',
    submittedAt: '2026-04-02T11:15:00Z',
    status: 'pending_approval',
    reviewNotes: 'Awaiting management identity & curriculum review.'
  }
];

export const INITIAL_MEET_SESSIONS: GoogleMeetSession[] = [
  {
    id: 'meet-session-1',
    title: 'Live Lab: Implementing Raft Consensus in Go & TLA+ Verification',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    sessionType: 'live_lecture',
    scheduledAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours from now
    durationMinutes: 60,
    meetUrl: 'https://meet.google.com/qmv-rtxw-byp',
    meetCode: 'qmv-rtxw-byp',
    status: 'scheduled',
    attendeeCount: 42,
    description: 'Interactive code walkthrough covering leader election split-vote handling, log replication state machines, and failover recovery testing.',
    createdAt: '2026-10-10T09:00:00Z',
    isRecorded: true,
    lectureFee: 75,
    systemRetentionFee: 22.50, // 30% retained by system
    educatorNetEarnings: 52.50  // 70% paid to educator
  },
  {
    id: 'meet-session-2',
    title: 'Weekly Faculty Office Hours & Architecture Q&A',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    sessionType: 'office_hours',
    scheduledAt: new Date(Date.now() + 26 * 3600 * 1000).toISOString(), // Tomorrow
    durationMinutes: 45,
    meetUrl: 'https://meet.google.com/ztk-mpxa-vhj',
    meetCode: 'ztk-mpxa-vhj',
    status: 'scheduled',
    attendeeCount: 18,
    maxAttendees: 50,
    description: 'Open floor for enrolled students to discuss Module 2 microservice cascading failure exercises, vector clock edge cases, and portfolio capstone designs.',
    createdAt: '2026-10-09T14:30:00Z',
    isRecorded: false,
    lectureFee: 45,
    systemRetentionFee: 13.50,
    educatorNetEarnings: 31.50
  },
  {
    id: 'meet-session-3',
    title: 'Masterclass: LLM Reasoning Traces & Constrained JSON Sampling',
    courseId: 'course-2',
    courseTitle: 'Generative AI Engineering: Production LLMs & Autonomous Agents',
    instructorId: 'user-teacher-1',
    instructorName: 'Dr. Elena Vance',
    sessionType: 'workshop',
    scheduledAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // Completed earlier today
    durationMinutes: 90,
    meetUrl: 'https://meet.google.com/bkr-wvyz-dfn',
    meetCode: 'bkr-wvyz-dfn',
    status: 'completed',
    attendeeCount: 68,
    maxAttendees: 100,
    description: 'Hands-on session using BNF grammar enforcers and tool-calling execution loops for resilient agent pipelines.',
    createdAt: '2026-10-08T11:00:00Z',
    isRecorded: true,
    lectureFee: 120,
    systemRetentionFee: 36.00,
    educatorNetEarnings: 84.00
  }
];

export const INITIAL_EDUCATOR_BILLING: EducatorBillingProfile = {
  royaltyPercentage: 70, // 70% instructor payout
  systemRetentionPercentage: 30, // 30% system retention
  defaultLectureFee: 75, // $75 standard lecture fee
  lectureFeesBySessionType: {
    live_lecture: 75,
    code_review: 95,
    office_hours: 45,
    workshop: 120,
    ama: 35
  },
  payoutSchedule: 'monthly_1st',
  payoutMethod: 'stripe_connect',
  payoutAccountLast4: '9214',
  taxWithholdingStatus: 'verified_w8ben',
  currency: 'USD',
  autoPayoutEnabled: true,
  minimumThreshold: 100
};

export const INITIAL_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay-2026-09',
    amount: 14250.00,
    currency: 'USD',
    status: 'completed',
    requestedAt: '2026-09-01T00:05:00Z',
    processedAt: '2026-09-02T16:30:00Z',
    method: 'Stripe Direct Deposit',
    accountReference: 'Checking •••• 9214',
    transactionCount: 74
  },
  {
    id: 'pay-2026-08',
    amount: 11840.50,
    currency: 'USD',
    status: 'completed',
    requestedAt: '2026-08-01T00:05:00Z',
    processedAt: '2026-08-02T14:15:00Z',
    method: 'Stripe Direct Deposit',
    accountReference: 'Checking •••• 9214',
    transactionCount: 62
  },
  {
    id: 'pay-2026-07',
    amount: 9420.00,
    currency: 'USD',
    status: 'completed',
    requestedAt: '2026-07-01T00:05:00Z',
    processedAt: '2026-07-02T11:00:00Z',
    method: 'Stripe Direct Deposit',
    accountReference: 'Checking •••• 9214',
    transactionCount: 49
  }
];

export const INITIAL_AI_RECOMMENDATIONS: AIPricingRecommendation[] = [
  {
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    currentPrice: 249,
    recommendedPrice: 289,
    projectedRevenueDeltaPercent: 16.2,
    rationale: 'High completion rate (88%) and industry-leading 4.96 rating indicate strong pricing inelasticity. Competitor masterclasses in cloud infrastructure average $295. A modest increase to $289 maximizes yield without dampening enrollments.',
    confidenceScore: 94,
    marketPositioning: 'premium_opportunity',
    suggestedPromotionTier: 'Flash 15% discount during launch of Module 3'
  },
  {
    courseId: 'course-2',
    courseTitle: 'Generative AI Engineering: Production LLMs & Autonomous Agents',
    currentPrice: 179,
    recommendedPrice: 199,
    projectedRevenueDeltaPercent: 11.8,
    rationale: 'Rapid search velocity in AI agents category (+34% MoM). Adjusting base to $199 with periodic $159 student promotions captures enterprise professional development budgets.',
    confidenceScore: 91,
    marketPositioning: 'underpriced',
    suggestedPromotionTier: 'Corporate Team Pack (3+ licenses @ $169 each)'
  }
];

export const INITIAL_STORAGE_METRICS: CloudStorageMetrics = {
  usedBytes: 46170898432, // ~43.0 GB
  totalBytes: 107374182400, // 100 GB
  bandwidthUsedGb: 1420,
  totalBandwidthGb: 10000,
  totalHostedVideos: 3,
  edgeLocationsActive: 48
};

export const INITIAL_HOSTED_VIDEOS: HostedVideo[] = [
  {
    id: 'video-host-1',
    title: 'Consensus Protocols: Implementing Raft Leader Leases in Production',
    description: 'Complete architecture teardown of monotonic leader terms, majority split-brain mitigation, and log compaction in distributed storage.',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    lessonId: 'les-1-1',
    lessonTitle: '1.1 System Architecture Overview & High-Availability Principles',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 596,
    fileSizeBytes: 1428571428, // 1.42 GB
    resolution: '4K',
    codec: 'H.264 / AAC (HLS Edge)',
    bitrateMbps: 19.2,
    status: 'ready',
    recordedAt: '2026-03-28T14:30:00Z',
    recordingSource: 'screen_mic',
    storageTier: 'Edge CDN Multi-Region',
    cdnEndpoint: 'https://cdn.aetheria.academy/streams/hls/raft-consensus-v1/master.m3u8',
    aiMetadata: {
      summary: 'Dr. Elena Vance explains the mechanics of distributed consensus, contrasting Raft with Paxos and detailing how leader leases prevent split-brain states under multi-region WAN latency.',
      chapters: [
        { timestamp: 0, title: '00:00 - Introduction & The Split-Brain Dilemma', summary: 'Why conventional master-worker replication breaks down across cloud availability zones.' },
        { timestamp: 95, title: '01:35 - Raft State Machine: Follower, Candidate, Leader', summary: 'Deconstructing heartbeat timers and randomized election timeouts.' },
        { timestamp: 240, title: '04:00 - Log Append Invariants & Commit Indexes', summary: 'Stepping through two-phase commit logs and verification quorums.' },
        { timestamp: 415, title: '06:55 - Network Partition & Split Quorum Recovery', summary: 'Live cluster chaos demonstration where a severed partition recovers without data loss.' },
        { timestamp: 530, title: '08:50 - Production Hardening & Summary', summary: 'Tuning disk fsync thresholds and snapshot compaction schedules.' }
      ],
      transcript: [
        { timestamp: 0, speaker: 'Dr. Elena Vance', text: 'Welcome back. In this lecture we tackle the hardest engineering problem in distributed infrastructure: maintaining safe state machine replication when network partitions occur.' },
        { timestamp: 95, speaker: 'Dr. Elena Vance', text: 'Every node in a Raft cluster operates in one of three states. Pay close attention to the randomized election interval—this is what mathematically avoids split votes.' },
        { timestamp: 240, speaker: 'Dr. Elena Vance', text: 'When a client issues a state mutation, the leader writes to its write-ahead log first, but does NOT acknowledge success until a strict majority of followers confirm the append.' },
        { timestamp: 415, speaker: 'Dr. Elena Vance', text: 'Notice on the terminal: even though node 3 is isolated behind simulated packet loss, our 3-of-5 quorum continues processing transactions seamlessly.' },
        { timestamp: 530, speaker: 'Dr. Elena Vance', text: 'Always remember to bound your uncompacted log size in production. Check out the 3 verification questions below before moving to Module 2.' }
      ],
      keyTakeaways: [
        'Randomized election timeouts (150ms-300ms) prevent split-vote deadlocks',
        'Strict majority quorums (N/2 + 1) guarantee overlapping nodes across partitions',
        'Log compaction with snapshots keeps RAM and disk footprints bounded'
      ],
      suggestedQuiz: [
        {
          id: 'q-raft-1',
          question: 'In a 5-node distributed cluster, what is the minimum quorum required to commit a transaction log entry?',
          options: ['2 nodes', '3 nodes', '4 nodes', 'All 5 nodes'],
          correctAnswerIndex: 1,
          explanation: 'A majority quorum is calculated as floor(N/2) + 1. For 5 nodes, floor(2.5) + 1 = 3 nodes.'
        },
        {
          id: 'q-raft-2',
          question: 'What mechanism prevents candidate nodes from endlessly competing in tied leader elections?',
          options: [
            'Randomized election timeouts on each cluster participant',
            'Centralized NTP master clock arbitration',
            'Selecting the node with the highest IP address',
            'Manual human intervention via web dashboard'
          ],
          correctAnswerIndex: 0,
          explanation: 'Randomized election timeouts ensure one candidate times out and collects votes before rival candidates trigger elections.'
        },
        {
          id: 'q-raft-3',
          question: 'Why does the leader withhold client acknowledgment until majority persistence occurs?',
          options: [
            'To prevent uncommitted dirty state from being witnessed if the leader crashes',
            'Because modern disk drives require synchronous sleep',
            'To conserve edge bandwidth',
            'It is optional and only recommended for archived databases'
          ],
          correctAnswerIndex: 0,
          explanation: 'If a leader acked before quorum commit and immediately crashed, the new leader would not contain that log entry, violating state linearizability.'
        }
      ],
      speechPacingWpm: 144,
      clarityScore: 96,
      tags: ['Distributed Systems', 'Consensus', 'Raft', 'Cloud Architecture']
    }
  },
  {
    id: 'video-host-2',
    title: 'Autonomous AI Agents: Orchestrating Swarm Tools & Live Code Execution',
    description: 'Building multi-agent task planning frameworks, structured schema validation, and sandboxed code execution environments.',
    courseId: 'course-2',
    courseTitle: 'Generative AI Engineering: Production LLMs & Autonomous Agents',
    lessonId: 'les-2-1',
    lessonTitle: '1.1 Foundations of Transformer Architectures & Self-Attention',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 653,
    fileSizeBytes: 892400100, // 892 MB
    resolution: '1080p',
    codec: 'AV1 / Opus (WebM Stream)',
    bitrateMbps: 11.2,
    status: 'ready',
    recordedAt: '2026-04-01T09:15:00Z',
    recordingSource: 'picture_in_picture',
    storageTier: 'Edge CDN Multi-Region',
    cdnEndpoint: 'https://cdn.aetheria.academy/streams/hls/ai-agents-swarm-v2/master.m3u8',
    aiMetadata: {
      summary: 'Practical guide to building production LLM agents that decompose complex user objectives into DAG execution graphs with tool sandboxing and automatic error recovery.',
      chapters: [
        { timestamp: 0, title: '00:00 - The Anatomy of an Autonomous Agent', summary: 'Memory, planning, reflection, and tool execution loops.' },
        { timestamp: 120, title: '02:00 - Structured JSON Schema Tool Definitions', summary: 'Using rigorous JSON schema contracts to enforce type safety in model responses.' },
        { timestamp: 310, title: '05:10 - Directed Acyclic Graph (DAG) Task Scheduling', summary: 'Executing parallel tools versus serial dependent steps.' },
        { timestamp: 490, title: '08:10 - Sandboxed Docker Container Runtime', summary: 'Executing generated Python and Bash code inside isolated gVisor sandboxes.' },
        { timestamp: 590, title: '09:50 - Self-Correction & Loop Termination', summary: 'Catching runtime exceptions and injecting stack traces back into the prompt.' }
      ],
      transcript: [
        { timestamp: 0, speaker: 'Dr. Elena Vance', text: 'Welcome. Today we move beyond simple zero-shot prompts to build autonomous agent swarms capable of reasoning and taking action.' },
        { timestamp: 120, speaker: 'Dr. Elena Vance', text: 'When connecting an LLM to backend APIs, never rely on loose unstructured text. We declare strict JSON schemas with responseMimeType.' },
        { timestamp: 310, speaker: 'Dr. Elena Vance', text: 'Observe our planner agent: it inspects the objective, emits a dependency graph, and triggers independent sub-tasks concurrently.' },
        { timestamp: 490, speaker: 'Dr. Elena Vance', text: 'Security is paramount. All dynamic code execution runs in an isolated ephemeral microVM with no access to platform environment secrets.' },
        { timestamp: 590, speaker: 'Dr. Elena Vance', text: 'If a tool call fails, the agent inspects the exit code and re-prompts itself with the corrected arguments automatically.' }
      ],
      keyTakeaways: [
        'Strict schema enforcement eliminates hallucinated tool arguments',
        'DAG scheduling cuts end-to-end task latency by up to 60%',
        'Ephemeral microVM sandboxes protect host infrastructure against prompt injection'
      ],
      suggestedQuiz: [
        {
          id: 'q-ai-1',
          question: 'What is the primary vulnerability when allowing an autonomous agent to execute bash commands directly on the host server?',
          options: [
            'Prompt injection allowing malicious actors to compromise environment credentials or filesystems',
            'Increased electrical consumption on the CPU',
            'Decreased token output velocity',
            'Loss of Wi-Fi connectivity'
          ],
          correctAnswerIndex: 0,
          explanation: 'Without sandboxing (like Docker or gVisor), prompt injections can cause the agent to run catastrophic rm -rf or exfiltrate secret keys.'
        },
        {
          id: 'q-ai-2',
          question: 'Why is DAG scheduling superior to purely sequential agent tool calls?',
          options: [
            'Independent tools can execute in parallel, substantially slashing latency',
            'It eliminates the need for an LLM model entirely',
            'It forces all tools to run on a single thread',
            'It guarantees zero API charges'
          ],
          correctAnswerIndex: 0,
          explanation: 'Parallel DAG branches allow independent tools (e.g. search web and fetch database simultaneously) to execute at the same time.'
        }
      ],
      speechPacingWpm: 138,
      clarityScore: 97,
      tags: ['Generative AI', 'Agents', 'Tool Calling', 'Sandboxing']
    }
  },
  {
    id: 'video-host-3',
    title: 'High-Performance In-Memory Zero-Copy Streaming in Rust & WebAssembly',
    description: 'Deep dive into memory safety without garbage collection, zero-copy byte buffers, and compiling high-throughput codecs to Wasm.',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 412,
    fileSizeBytes: 620500000, // 620 MB
    resolution: '1080p',
    codec: 'H.264 / AAC',
    bitrateMbps: 12.0,
    status: 'ready',
    recordedAt: '2026-04-05T16:00:00Z',
    recordingSource: 'webcam_mic',
    storageTier: 'Edge CDN Multi-Region',
    cdnEndpoint: 'https://cdn.aetheria.academy/streams/hls/rust-zero-copy-v1/master.m3u8',
    aiMetadata: {
      summary: 'Explore zero-copy buffer slicing and memory management in modern systems programming, eliminating CPU cache misses in real-time streaming engines.',
      chapters: [
        { timestamp: 0, title: '00:00 - Why Garbage Collection Pauses Hurt Streaming', summary: 'Latency spikes in high-throughput network pipelines.' },
        { timestamp: 90, title: '01:30 - Borrow Checker & Lifetime Annotations', summary: 'Guaranteeing compile-time safety for memory slices without runtime cost.' },
        { timestamp: 220, title: '03:40 - Zero-Copy Ring Buffers in Action', summary: 'Passing network packets from kernel space to user space without allocation.' },
        { timestamp: 350, title: '05:50 - Compiling to WebAssembly for Browser Acceleration', summary: 'Running native performance codecs directly in client browsers.' }
      ],
      transcript: [
        { timestamp: 0, speaker: 'Dr. Elena Vance', text: 'Hello everyone. Today we are looking at how zero-copy architecture allows us to saturate 100-gigabit network interfaces without melting our CPU.' },
        { timestamp: 90, speaker: 'Dr. Elena Vance', text: 'By utilizing Rust lifetimes, we can pass references to slice buffers without a single heap allocation or copy.' },
        { timestamp: 220, speaker: 'Dr. Elena Vance', text: 'Here in our ring buffer benchmark, observe the flat 99th percentile latency curve under 500,000 packets per second.' },
        { timestamp: 350, speaker: 'Dr. Elena Vance', text: 'When we compile this same logic to WebAssembly, students can run client-side audio DSP right in their browser window.' }
      ],
      keyTakeaways: [
        'Zero-copy architectures eliminate memory allocator contention in high-throughput loops',
        'Rust ownership guarantees thread-safety without lock-induced priority inversions',
        'WebAssembly brings near-native compute speeds to client-side browser workloads'
      ],
      suggestedQuiz: [
        {
          id: 'q-rust-1',
          question: 'What is the primary benefit of zero-copy buffer slicing in network I/O?',
          options: [
            'It avoids copying payload bytes between kernel memory and user-space memory buffers',
            'It converts binary data into plain ASCII text automatically',
            'It doubles internet download speeds for the end-user',
            'It encrypts packets using quantum computing'
          ],
          correctAnswerIndex: 0,
          explanation: 'Zero-copy ensures data is read directly from network buffers without wasteful intermediate memory copies.'
        }
      ],
      speechPacingWpm: 148,
      clarityScore: 95,
      tags: ['Rust', 'WebAssembly', 'Performance', 'Streaming']
    }
  }
];

export const INITIAL_ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    lessonId: 'les-1-1-2',
    lessonTitle: '1.2 The Raft Consensus Protocol: Leader Election & Log Replication',
    studentId: 'user-student-1',
    studentName: 'Alex Mercer',
    studentAvatar: 'AM',
    studentRole: 'student',
    title: 'Deterministic Raft Election Timeout with Randomized Jitter in Rust',
    summary: 'A robust state machine implementation tracking Follower -> Candidate -> Leader transitions with heartbeat timers, atomic term increments, and split-brain resolution.',
    language: 'rust',
    repoUrl: 'https://github.com/alexmercer/raft-consensus-engine',
    codeSnippet: `// Raft State Machine: Election Timeout & Candidate Transition
pub struct RaftNode {
    pub id: NodeId,
    pub current_term: Term,
    pub voted_for: Option<NodeId>,
    pub log: Vec<LogEntry>,
    pub role: NodeRole,
    election_timeout: Duration,
}

impl RaftNode {
    pub async fn start_election(&mut self, peers: &[PeerClient]) -> Result<bool, ElectionError> {
        self.role = NodeRole::Candidate;
        self.current_term += 1;
        self.voted_for = Some(self.id);
        
        let mut votes_granted = 1; // Vote for self
        let majority = (peers.len() + 1) / 2 + 1;

        let request = RequestVoteArgs {
            term: self.current_term,
            candidate_id: self.id,
            last_log_index: self.log.len().saturating_sub(1),
            last_log_term: self.log.last().map_or(0, |e| e.term),
        };

        // Broadcast RequestVote RPC with randomized timeout jitter (150ms - 300ms)
        let (tx, mut rx) = mpsc::channel(peers.len());
        for peer in peers {
            let client = peer.clone();
            let args = request.clone();
            let sender = tx.clone();
            tokio::spawn(async move {
                if let Ok(reply) = client.request_vote(args).await {
                    let _ = sender.send(reply.vote_granted).await;
                }
            });
        }

        while let Some(granted) = rx.recv().await {
            if granted {
                votes_granted += 1;
                if votes_granted >= majority {
                    self.become_leader();
                    return Ok(true);
                }
            }
        }
        Ok(false)
    }
}`,
    submittedAt: '2 days ago',
    status: 'distinguished',
    reviews: [
      {
        id: 'rev-1',
        submissionId: 'sub-1',
        reviewerId: 'user-teacher-1',
        reviewerName: 'Dr. Elena Vance',
        reviewerAvatar: 'EV',
        reviewerRole: 'teacher',
        rating: 5,
        rubric: {
          clarity: 5,
          architecture: 5,
          robustness: 5
        },
        strengths: 'Exceptional use of saturating arithmetic and tokio channels for vote collation. The quorum majority calculation is mathematically rigorous.',
        improvements: 'Consider adding a cancellation token for ongoing RPCs once majority quorum is reached to save network bandwidth.',
        comment: 'Outstanding submission, Alex. This architecture mirrors production consensus engines like etcd and TiKV. The randomized timeout jitter guarantees clean partition recovery.',
        createdAt: '1 day ago',
        helpfulVotes: 7,
        helpfulUserIds: ['user-student-2', 'user-student-3', 'user-student-4'],
        comments: [
          {
            id: 'rev-com-1',
            authorId: 'user-student-1',
            authorName: 'Alex Mercer',
            authorAvatar: 'AM',
            authorRole: 'student',
            content: 'Thank you Dr. Vance! Added a CancellationToken via tokio_util to abort redundant candidate RPCs once quorum is achieved.',
            createdAt: '18 hours ago'
          }
        ]
      },
      {
        id: 'rev-2',
        submissionId: 'sub-1',
        reviewerId: 'user-admin-1',
        reviewerName: 'Marcus Sterling',
        reviewerAvatar: 'MS',
        reviewerRole: 'admin',
        rating: 4,
        rubric: {
          clarity: 4,
          architecture: 5,
          robustness: 4
        },
        strengths: 'Clean async/await structure and good memory boundaries without unnecessary clones.',
        improvements: 'Add telemetry spans around the vote collation loop so distributed traces highlight slowest responder nodes.',
        comment: 'Very solid work. Verified against the Raft paper safety invariants.',
        createdAt: '16 hours ago',
        helpfulVotes: 3,
        helpfulUserIds: ['user-student-1'],
        comments: []
      }
    ]
  },
  {
    id: 'sub-2',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    lessonId: 'les-1-1-1',
    lessonTitle: '1.1 Physical Time vs. Lamport Logical Clocks',
    studentId: 'user-student-3',
    studentName: 'Tariq Al-Mansoor',
    studentAvatar: 'TM',
    studentRole: 'student',
    title: 'Causal Vector Clock Matrix with Pruning Garbage Collector',
    summary: 'A high-performance TypeScript implementation of causal vector clocks with vector matrix delta compression and periodic node state tombstone compaction.',
    language: 'typescript',
    repoUrl: 'https://github.com/tariq-quant/vector-clock-matrix',
    codeSnippet: `export class VectorClock {
  private clock: Map<string, number> = new Map();

  constructor(public readonly nodeId: string) {
    this.clock.set(nodeId, 0);
  }

  public tick(): void {
    const current = this.clock.get(this.nodeId) || 0;
    this.clock.set(this.nodeId, current + 1);
  }

  public merge(remote: Map<string, number>): void {
    for (const [node, time] of remote.entries()) {
      const localTime = this.clock.get(node) || 0;
      this.clock.set(node, Math.max(localTime, time));
    }
    this.tick();
  }

  public compare(other: VectorClock): 'before' | 'after' | 'concurrent' | 'equal' {
    let hasLess = false;
    let hasGreater = false;
    const allNodes = new Set([...this.clock.keys(), ...other.clock.keys()]);

    for (const node of allNodes) {
      const t1 = this.clock.get(node) || 0;
      const t2 = other.clock.get(node) || 0;
      if (t1 < t2) hasLess = true;
      if (t1 > t2) hasGreater = true;
    }

    if (hasLess && !hasGreater) return 'before';
    if (!hasLess && hasGreater) return 'after';
    if (!hasLess && !hasGreater) return 'equal';
    return 'concurrent';
  }
}`,
    submittedAt: '3 days ago',
    status: 'reviewed',
    reviews: [
      {
        id: 'rev-3',
        submissionId: 'sub-2',
        reviewerId: 'user-student-1',
        reviewerName: 'Alex Mercer',
        reviewerAvatar: 'AM',
        reviewerRole: 'student',
        rating: 5,
        rubric: {
          clarity: 5,
          architecture: 4,
          robustness: 5
        },
        strengths: 'The concurrency detection logic is clean, concise, and mathematically sound.',
        improvements: 'For clusters with 1,000+ nodes, consider sparse array bitmasks or Roaring Bitmaps instead of standard Maps.',
        comment: 'Great peer implementation! Tested your compare method with cyclic race conditions and it accurately tagged divergent branches as concurrent.',
        createdAt: '2 days ago',
        helpfulVotes: 5,
        helpfulUserIds: ['user-student-3', 'user-student-4'],
        comments: [
          {
            id: 'rev-com-2',
            authorId: 'user-student-3',
            authorName: 'Tariq Al-Mansoor',
            authorAvatar: 'TM',
            authorRole: 'student',
            content: 'Great insight Alex! Exploring Roaring Bitmaps for the next iteration to keep wire size bounded.',
            createdAt: '1 day ago'
          }
        ]
      }
    ]
  },
  {
    id: 'sub-3',
    courseId: 'course-1',
    courseTitle: 'Distributed Systems & Cloud Architecture at Scale',
    lessonId: 'les-1-1-2',
    lessonTitle: '1.2 The Raft Consensus Protocol: Leader Election & Log Replication',
    studentId: 'user-student-4',
    studentName: 'Claire Dupont',
    studentAvatar: 'CD',
    studentRole: 'student',
    title: 'Formal TLA+ Specification and Model Check for Raft Safety',
    summary: 'A formal specification model in TLA+ proving election safety invariants: at most one leader can be elected per term, even under arbitrary message loss and network partitions.',
    language: 'tla+',
    repoUrl: 'https://github.com/claire-dupont/raft-tla-spec',
    codeSnippet: `---- MODULE RaftSafety ----
EXTENDS Naturals, FiniteSets, Sequences

CONSTANTS Server, Value
VARIABLES currentTerm, state, votedFor, log, commitIndex

TypeOK ==
  /\ currentTerm \\in [Server -> Nat]
  /\ state \\in [Server -> {"Follower", "Candidate", "Leader"}]
  /\ votedFor \\in [Server -> Server \\cup {None}]

ElectionSafety ==
  \\A s1, s2 \\in Server :
    (state[s1] = "Leader" /\\ state[s2] = "Leader" /\\ currentTerm[s1] = currentTerm[s2])
      => s1 = s2

====`,
    submittedAt: '4 days ago',
    status: 'distinguished',
    reviews: [
      {
        id: 'rev-4',
        submissionId: 'sub-3',
        reviewerId: 'user-teacher-2',
        reviewerName: 'Prof. Julian Thorne',
        reviewerAvatar: 'JT',
        reviewerRole: 'teacher',
        rating: 5,
        rubric: {
          clarity: 5,
          architecture: 5,
          robustness: 5
        },
        strengths: 'Rigorous formal specification. The TLC model checker completes verification of 5 nodes within 42 seconds.',
        improvements: 'You could extend the invariant to log matching property across uncommitted follower slices.',
        comment: 'Superb verification work, Claire. This elevates student submissions from heuristic code to mathematical certainty.',
        createdAt: '3 days ago',
        helpfulVotes: 6,
        helpfulUserIds: ['user-student-1', 'user-student-3'],
        comments: []
      }
    ]
  }
];


