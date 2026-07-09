-- Upload all app content to Supabase (run once in SQL Editor)
-- Requires: supabase/schema.sql already applied

insert into public.app_content (id, content, updated_at)
values (
  'main',
  $json${
  "meta": {
    "herName": "Ishu",
    "yourName": "Siddhant",
    "ourStartDate": "2025-12-20",
    "appTitle": "For Ishu",
    "appDescription": "A little love app made just for Ishu — notes, games, letters, and more."
  },
  "landing": {
    "eyebrow": "A little something for",
    "subtitle": "Made with love by {{yourName}}",
    "cta": "Open your surprise"
  },
  "layout": {
    "headerBefore": "For you, ",
    "footerBefore": "Always & forever, ",
    "moreMenuTitle": "More"
  },
  "daysHero": {
    "greeting": "Hey {{herName}}",
    "subtitle": "Everything here is made just for you.",
    "daysLabel": "of loving {{herName}}"
  },
  "navigation": {
    "primary": [
      { "to": "/home", "label": "Home", "icon": "Home", "end": true },
      { "to": "/jar", "label": "Love Jar", "icon": "ScrollText" },
      { "to": "/letters", "label": "Letters", "icon": "Mail" },
      { "to": "/games", "label": "Games", "icon": "Gamepad2" }
    ],
    "more": [
      { "to": "/daily", "label": "Daily Note", "icon": "Sun" },
      { "to": "/timeline", "label": "Our Story", "icon": "Clock" },
      { "to": "/compliments", "label": "Compliments", "icon": "Gift" },
      { "to": "/reasons", "label": "Reasons", "icon": "ListChecks" },
      { "to": "/bucket-list", "label": "Bucket List", "icon": "ListTodo" },
      { "to": "/dates", "label": "Date Ideas", "icon": "MapPin" },
      { "to": "/mood", "label": "Mood Check-in", "icon": "Smile" },
      { "to": "/favorites", "label": "Your Favorites", "icon": "Star" },
      { "to": "/photos", "label": "Our Photos", "icon": "Images" }
    ]
  },
  "homeSections": [
    {
      "title": "For You",
      "cards": [
        { "to": "/daily", "icon": "Sun", "title": "Daily Note", "desc": "Today's message", "color": "card-gold" },
        { "to": "/compliments", "icon": "Gift", "title": "Compliments", "desc": "Showered with love", "color": "card-blue" },
        { "to": "/reasons", "icon": "ListChecks", "title": "Reasons", "desc": "Why I love you", "color": "card-rose" },
        { "to": "/letters", "icon": "Mail", "title": "Open When", "desc": "Letters for you", "color": "card-gold" },
        { "href": "https://beatify-2.vercel.app/", "icon": "Music", "title": "Listen Music", "desc": "Our music library", "color": "card-purple" }
      ]
    },
    {
      "title": "Together",
      "cards": [
        { "to": "/timeline", "icon": "Clock", "title": "Our Story", "desc": "Milestones & song", "color": "card-rose" },
        { "to": "/bucket-list", "icon": "ListTodo", "title": "Bucket List", "desc": "Adventures ahead", "color": "card-purple" },
        { "to": "/dates", "icon": "MapPin", "title": "Date Ideas", "desc": "Pick our next date", "color": "card-pink" },
        { "to": "/favorites", "icon": "Star", "title": "Favorites", "desc": "Things you love", "color": "card-blue" },
        { "to": "/photos", "icon": "Images", "title": "Our Photos", "desc": "Memories together", "color": "card-pink" }
      ]
    },
    {
      "title": "Play",
      "cards": [
        { "to": "/games", "icon": "Gamepad2", "title": "All Games", "desc": "9 games to play", "color": "card-purple", "wide": true },
        { "href": "https://beatify-2.vercel.app/", "icon": "Music", "title": "Listen Music", "desc": "Play our songs", "color": "card-pink", "wide": true }
      ]
    }
  ],
  "gamesPage": {
    "title": "Fun Games",
    "subtitle": "Play something silly. Win nothing but smiles."
  },
  "games": [
    {
      "to": "/games/catch-hearts",
      "icon": "Target",
      "title": "Catch the Hearts",
      "desc": "Tap hearts before they disappear! 20 seconds — how many can you catch?",
      "color": "card-rose",
      "previewLabel": "Catch"
    },
    {
      "to": "/games/heart-rush",
      "icon": "Zap",
      "title": "Heart Rush",
      "desc": "Mash the heart button as fast as you can in 10 seconds!",
      "color": "card-pink",
      "previewLabel": "Rush"
    },
    {
      "to": "/games/quiz",
      "icon": "Brain",
      "title": "Love Quiz",
      "desc": "How well do you know us? Answer cute questions and see your score.",
      "color": "card-purple",
      "previewLabel": "Quiz"
    },
    {
      "to": "/games/would-you-rather",
      "icon": "Scale",
      "title": "Would You Rather",
      "desc": "Pick between two cute options — no wrong answers here.",
      "color": "card-blue",
      "previewLabel": "Rather"
    },
    {
      "to": "/games/truth-or-dare",
      "icon": "MessageCircle",
      "title": "Truth or Dare",
      "desc": "Sweet truths and silly dares — the wholesome edition.",
      "color": "card-gold"
    },
    {
      "to": "/games/wheel",
      "icon": "CircleDot",
      "title": "Spin the Wheel",
      "desc": "Spin for date ideas, coupons, and sweet surprises!",
      "color": "card-rose"
    },
    {
      "to": "/games/dice",
      "icon": "Dices",
      "title": "Dice of Love",
      "desc": "Roll the dice and let fate pick your surprise.",
      "color": "card-purple"
    },
    {
      "to": "/games/scratch",
      "icon": "Sparkles",
      "title": "Scratch Surprise",
      "desc": "Scratch the card to reveal a hidden prize coupon!",
      "color": "card-gold",
      "previewLabel": "Scratch"
    },
    {
      "to": "/games/memory",
      "icon": "LayoutGrid",
      "title": "Memory Match",
      "desc": "Flip cards and find matching pairs. A cozy little brain teaser.",
      "color": "card-blue",
      "previewLabel": "Memory"
    }
  ],
  "home": {
    "gameStripLabel": "Jump into a game"
  },
  "secretHeart": {
    "hint": "Psst... try tapping the heart below",
    "final": "Made with all my love for you, {{herName}}",
    "messages": [
      "You found a secret! I love you 💕",
      "Keep clicking... there's more!",
      "Your persistence is adorable",
      "Okay okay, you win. You're the cutest.",
      "I made this whole app just for you",
      "Forever yours, {{yourName}} ❤️",
      "Every tap is a kiss from me to you",
      "You're the reason I smile at my phone",
      "I'd build a hundred apps if it made you happy",
      "Still clicking? I love that about you",
      "Okay this is the last one... just kidding, keep going",
      "You found the secret of secrets: I adore you"
    ]
  },
  "storageKeys": {
    "bucketList": "ishu-bucket-list",
    "catchHeartsHighScore": "ishu-catch-hearts-high-score",
    "heartRushHighScore": "ishu-heart-rush-high-score"
  },
  "heartRushMessages": [
    { "minTaps": 100, "message": "LEGENDARY. Your fingers are made of pure love." },
    { "minTaps": 80, "message": "UNSTOPPABLE finger energy!" },
    { "minTaps": 60, "message": "That was incredible — my heart can't keep up!" },
    { "minTaps": 50, "message": "Wow, that's a lot of love taps!" },
    { "minTaps": 40, "message": "You're on fire! Keep that energy going." },
    { "minTaps": 30, "message": "Solid tapping — my heart approves." },
    { "minTaps": 20, "message": "Nice rhythm! Every tap felt like a hug." },
    { "minTaps": 10, "message": "Good start — my heart is warming up." },
    { "minTaps": 0, "message": "Keep going — every tap counts as a hug." }
  ],
  "ourSong": {
    "title": "Your Song Here",
    "artist": "Artist Name",
    "note": "This song reminds me of you.",
    "beatifyUuid": ""
  },
  "timeline": [
    { "date": "Dec 2025", "title": "The day we met", "desc": "The universe aligned and my life changed forever." },
    { "date": "Dec 2025", "title": "Our first conversation", "desc": "Hours felt like minutes. I knew you were special." },
    { "date": "Dec 2025", "title": "Our first date", "desc": "Nervous laughs, bad jokes, and the best feeling in the world." },
    { "date": "Jan 2026", "title": "First 'I love you'", "desc": "Three words. Infinite meaning. My heart knew before my mouth did." },
    { "date": "Jan 2026", "title": "Our first adventure", "desc": "Anywhere with you feels like the best place on earth." },
    { "date": "Feb 2026", "title": "Late night talks", "desc": "When the world went quiet and it was just us." },
    { "date": "Mar 2026", "title": "Inside jokes born", "desc": "The kind only we understand — and that's the best part." },
    { "date": "Apr 2026", "title": "A ordinary day, extraordinary", "desc": "Realized I'd rather have boring days with you than exciting days without." },
    { "date": "May 2026", "title": "This app", "desc": "Built with love, just for you — because you deserve the world." },
    { "date": "Forever", "eventDate": "2025-12-20", "title": "Still falling", "desc": "Every day with you feels like the beginning." }
  ],
  "bucketList": [
    "Watch the sunrise together",
    "Take a spontaneous road trip",
    "Cook a meal from scratch together",
    "Stargaze on a rooftop",
    "Make a photo album of us",
    "Dance in the rain",
    "Visit a place we've never been",
    "Write letters to open in a year",
    "Have a cozy movie marathon",
    "Try every ice cream shop in town",
    "Build a blanket fort and camp in the living room",
    "Take a polaroid photo booth day",
    "Learn to cook each other's favorite dish",
    "Go on a sunrise hike",
    "Have a no-phones day together",
    "Create a couple playlist and listen on a drive",
    "Visit a flower market and pick bouquets",
    "Try a pottery or painting class together",
    "Watch the sunset from somewhere new",
    "Write our story in a journal",
    "Have a themed dinner night at home",
    "Go thrift shopping and pick outfits for each other",
    "Take a day trip to a nearby town",
    "Make a time capsule for our future selves",
    "Celebrate every little milestone together",
    "Adopt a plant and name it together",
    "Have a picnic under the stars",
    "Recreate our first date",
    "Make a scrapbook of our memories",
    "Plan a surprise weekend getaway"
  ],
  "dailyMessages": [
    "Good morning, beautiful. Today is another day to love you.",
    "You're the first thing I think about when I wake up.",
    "Just a reminder: you're doing amazing, even on hard days.",
    "I hope something makes you smile today — like thinking of us.",
    "You're loved more than words can say.",
    "Can't wait to see you again. Counting the moments.",
    "You make ordinary days feel like magic.",
    "Sending you a virtual hug right now.",
    "The world is better because you're in it.",
    "You + today = my favorite combination.",
    "Monday? Doesn't matter. You're still my favorite person.",
    "Take a deep breath — you've got this, and I've got you.",
    "Your laugh is my favorite sound in the universe.",
    "Reminder: you are enough. More than enough.",
    "I hope your coffee is hot and your day is sweet.",
    "Thinking of you. Again. Still. Always.",
    "You're the plot twist I never saw coming — and the best one.",
    "Whatever today brings, we'll figure it out together.",
    "You deserve all the good things coming your way.",
    "Midweek check-in: still completely obsessed with you.",
    "Your happiness matters to me more than anything.",
    "One day closer to seeing your beautiful face.",
    "Friday energy: you, me, and nowhere to be.",
    "Weekend vibes: lazy mornings and your hand in mine.",
    "Saturday reminder — you're my favorite adventure.",
    "Sunday reset: grateful for you, always.",
    "New week, same love for you — actually, more.",
    "You're stronger than you think. I believe in you.",
    "A little note to say: I'm proud of you.",
    "Random thought: marrying you would be the easiest yes ever.",
    "You make me want to be the best version of myself.",
    "Today's forecast: 100% chance of me loving you."
  ],
  "dateIdeas": [
    "Picnic in the park with homemade snacks",
    "Cook dinner together — your favorite cuisine",
    "Late night drive with our playlist",
    "Museum or art gallery date",
    "Movie night with blankets and zero plans",
    "Try a new café and rate the desserts",
    "Sunset walk and photo session",
    "Board game night — loser does dishes",
    "DIY pizza night at home",
    "Bookstore browse + coffee afterwards",
    "Karaoke night (duet mandatory)",
    "Farmers market morning + brunch",
    "Mini golf or bowling — competitive but cute",
    "Bake cookies together and eat half the dough",
    "Thrift store challenge — best outfit under ₹500",
    "Rooftop dinner with city lights",
    "Spa night at home — face masks and relaxation",
    "Try a new cuisine we've never had",
    "Photo walk around the neighborhood",
    "Build a Lego set or puzzle together",
    "Watch the sunset with chai or coffee",
    "Visit a local market and pick ingredients for dinner",
    "Stargazing with hot chocolate",
    "Recreate a fancy restaurant meal at home",
    "Go for a long walk with no destination",
    "Arcade date — winner picks dessert",
    "Plant shopping and pot something together",
    "Watch old videos/photos of us and reminisce",
    "Breakfast date before the world wakes up",
    "Surprise picnic — I'll pack everything"
  ],
  "moodResponses": {
    "happy": { "emoji": "😊", "label": "Happy", "message": "Your happiness is contagious. I'm so glad you're feeling good — you deserve every bit of joy!" },
    "loved": { "emoji": "🥰", "label": "Loved", "message": "Good — because you ARE so loved. By me, always. More than you know." },
    "miss": { "emoji": "🥺", "label": "Missing you", "message": "I miss you too. Close your eyes — I'm sending the biggest hug across whatever distance separates us." },
    "tired": { "emoji": "😴", "label": "Tired", "message": "Rest, my love. You've earned it. I'll be right here when you wake up. Sweet dreams." },
    "sad": { "emoji": "💙", "label": "Down", "message": "It's okay to not be okay. I'm here, always. This feeling will pass — and I'll be holding your hand through it." },
    "silly": { "emoji": "😜", "label": "Silly", "message": "That's my girl! Never stop being goofy — it's one of my favorite things about you." },
    "anxious": { "emoji": "😰", "label": "Anxious", "message": "Breathe with me. In... out... You're safe. Whatever's worrying you, we can face it together. One step at a time." },
    "excited": { "emoji": "🤩", "label": "Excited", "message": "YES! I love this energy! Tell me everything — I want to celebrate with you!" },
    "stressed": { "emoji": "😤", "label": "Stressed", "message": "Deep breath. You've handled hard things before. Let me help carry some of this — you don't have to do it alone." },
    "grateful": { "emoji": "🙏", "label": "Grateful", "message": "I'm grateful for you too. Every single day. You make my life infinitely better." },
    "bored": { "emoji": "😑", "label": "Bored", "message": "Come play a game on here! Or text me — I'll entertain you. Or we plan something fun for later." },
    "angry": { "emoji": "😠", "label": "Frustrated", "message": "That's valid. Feel it. I'm not going anywhere. Want to vent? I'm all ears." }
  },
  "herFavorites": [
    { "thing": "Coffee", "note": "The way you hold the cup with both hands" },
    { "thing": "Late night talks", "note": "When the world is quiet and it's just us" },
    { "thing": "Your playlists", "note": "Every song feels like it was picked for me" },
    { "thing": "Comfort movies", "note": "Rewatching the same ones and still laughing" },
    { "thing": "Surprise plans", "note": "The look on your face when I plan something" },
    { "thing": "Long walks", "note": "Hand in hand, nowhere to be" },
    { "thing": "Sunny days", "note": "You glow even brighter in the sunlight" },
    { "thing": "Sweet treats", "note": "The way your eyes light up at dessert" },
    { "thing": "Cozy blankets", "note": "Burrowing in and getting comfortable" },
    { "thing": "Good books", "note": "Getting lost in a story — just like I get lost in you" },
    { "thing": "Photography", "note": "Capturing moments the way you capture my heart" },
    { "thing": "Rainy weather", "note": "Perfect excuse to stay in together" },
    { "thing": "Your perfume", "note": "One whiff and I'm thinking of you all day" },
    { "thing": "Morning routines", "note": "The little rituals that make you, you" },
    { "thing": "Inside jokes", "note": "The ones that make us laugh until we cry" },
    { "thing": "Stargazing", "note": "Looking up at the sky, feeling small and lucky" },
    { "thing": "Handwritten notes", "note": "Something about your handwriting makes everything sweeter" },
    { "thing": "Your voice", "note": "My favorite sound — especially when you say my name" }
  ],
  "reasons": [
    "Your smile lights up my entire day",
    "The way you laugh at my terrible jokes",
    "How you make ordinary moments feel magical",
    "Your kindness — to me and to everyone around you",
    "The way you believe in me even when I don't",
    "How safe and at home I feel with you",
    "Your beautiful mind and the way you see the world",
    "Every little thing you do without even trying",
    "How you make me want to be a better person",
    "Simply because you're you — and that's more than enough",
    "The way you listen — really listen — when I talk",
    "Your patience, even when I'm being difficult",
    "How you remember the tiny details about me",
    "The sparkle in your eyes when you're excited",
    "Your strength, even when you don't see it yourself",
    "How you care about the people you love fiercely",
    "The way you make me laugh when I need it most",
    "Your honesty — even when it's hard",
    "How you turn bad days into bearable ones",
    "The way you say my name",
    "Your creativity and the way you see beauty everywhere",
    "How you never give up on us",
    "Your warmth — like sunshine on a cold day",
    "The way you hold my hand without thinking",
    "How you make me feel like the luckiest person alive",
    "Your dreams — and how I want to help you reach every one",
    "The way you dance when you think no one's watching",
    "How you forgive and move forward with grace",
    "Your voice — especially your sleepy morning voice",
    "Because loving you is the easiest thing I've ever done"
  ],
  "compliments": [
    "You're literally the best thing that's ever happened to me",
    "If cuteness was a crime, you'd be serving life",
    "The universe really said 'let me cook' when it made you",
    "You're not just pretty — you're absolutely stunning inside and out",
    "I still get butterflies. Every. Single. Time.",
    "You make my heart do that weird happy flip thing",
    "10/10 would fall in love with you again",
    "You're the human equivalent of a warm hug",
    "My favorite notification is anything from you",
    "You're the reason I believe in magic",
    "If I had to choose one person to be stuck on a desert island with — obviously you",
    "You're cuter than every puppy video on the internet combined",
    "Your smile should be classified as a national treasure",
    "Scientists should study how one person can be this perfect",
    "You're the main character and I'm just lucky to be in your story",
    "I'd write poetry about you but words aren't enough",
    "You make 'forever' sound like not long enough",
    "Your laugh is my favorite song",
    "If beauty were time, you'd be an eternity",
    "You're the answer to every 'what if' I never knew I had",
    "Even on your worst day, you're still my best day",
    "You glow differently — and everyone can see it",
    "I'd choose you in every timeline, every universe",
    "Your heart is as beautiful as your face — maybe more",
    "You're not just my person — you're my favorite everything",
    "The way you exist makes the world a better place",
    "I fall in love with new parts of you every day",
    "You're proof that good things happen to good people",
    "Your energy is addictive — in the best way",
    "If I could bottle your essence, I'd never be sad again",
    "You're the plot twist I prayed for",
    "Honestly? You're out of my league and I'm not even mad about it"
  ],
  "openWhen": [
    {
      "label": "Open when you're sad",
      "message": "Hey love, I know things feel heavy right now. But remember — you've gotten through 100% of your bad days so far. I'm always here, and this too shall pass. You're stronger than you know. 💕"
    },
    {
      "label": "Open when you miss me",
      "message": "Close your eyes. Feel that? That's me thinking about you right now. Distance is just a number — my heart is always right there with you. Can't wait to see you again. 🤗"
    },
    {
      "label": "Open when you need a laugh",
      "message": "Why did the heart go to school? Because it wanted to learn how to love better! ...Okay that was bad. But you smiling right now? That was the point. You're adorable when you cringe. 😂"
    },
    {
      "label": "Open when you need to know you're loved",
      "message": "You are SO loved. Not because of what you do or how you look — but because of who you are. You matter more than you know. I love you, {{herName}}. Always have, always will. ❤️"
    },
    {
      "label": "Open when you can't sleep",
      "message": "Hey night owl. I hope you find peace soon. Imagine my arms around you, the world quiet, nothing to worry about until morning. Rest, beautiful. I'll be here when you wake. 🌙"
    },
    {
      "label": "Open when you're stressed",
      "message": "Stop. Breathe. You're doing better than you think. One thing at a time. I'm proud of you for pushing through. Let me take some of the weight — you don't have to carry everything alone. 💪"
    },
    {
      "label": "Open when you're bored",
      "message": "Boredom is just the universe telling you to text me. Or play a game on this app. Or plan our next adventure. Or... just know I'm thinking of you and that's never boring. 😄"
    },
    {
      "label": "Open when you're angry",
      "message": "Your feelings are valid. Take your time. I'm not here to fix it — just to sit with you until it passes. You don't have to be okay right now. I'm not going anywhere. 🤝"
    },
    {
      "label": "Open on a bad day",
      "message": "Bad days don't last. But my love for you does. Tomorrow is a fresh start. Tonight, be gentle with yourself. You deserve kindness — especially from yourself. 🌸"
    },
    {
      "label": "Open when you need motivation",
      "message": "You've overcome things that would break most people. You're capable of more than you know. I believe in you — even when you don't believe in yourself. Go get 'em, superstar. ⭐"
    },
    {
      "label": "Open when you're feeling insecure",
      "message": "Listen to me. You are enough. You are more than enough. The way I see you? Perfect. Flaws and all — especially the flaws, because they're part of what makes you YOU. 💖"
    },
    {
      "label": "Open on our anniversary",
      "message": "Another year of us. Another year of laughs, love, and choosing each other. Thank you for being my person. Here's to forever — and then some. Happy anniversary, my love. 🥂"
    },
    {
      "label": "Open when you achieve something",
      "message": "I KNEW IT! I'm so incredibly proud of you! You worked hard and it paid off. Celebrate big — you earned every bit of this. I'm cheering the loudest from wherever I am. 🎉"
    },
    {
      "label": "Open when you need a hug",
      "message": "🤗🤗🤗 Consider this the tightest, longest, warmest hug. The kind where I don't let go until you're ready. I'm here. Always. 💕"
    }
  ],
  "loveNotes": [
    "Every love song makes sense now that I have you",
    "You're my favorite hello and my hardest goodbye",
    "I fall in love with you a little more every day",
    "Home isn't a place — it's wherever you are",
    "You + Me = my favorite equation",
    "I choose you. Today, tomorrow, always.",
    "Thinking of you is my favorite pastime",
    "You're the best part of every day",
    "My heart belongs to you — no returns, no exchanges",
    "You make me believe in soulmates",
    "I'd rather argue with you than make up with anyone else",
    "Your name is my safe word for happiness",
    "Forever isn't long enough with you",
    "You're the reason I look forward to tomorrow",
    "Loving you is the easiest decision I ever made",
    "You're my once-in-a-lifetime",
    "Every moment with you is a memory I want to keep",
    "You're not just my girlfriend — you're my best friend",
    "I love you more than yesterday, less than tomorrow",
    "You're the missing piece I didn't know I was looking for",
    "With you, even silence feels full",
    "You're my favorite notification, my favorite call, my favorite everything",
    "I want to grow old and annoying with you",
    "You had me at 'hey'",
    "Still can't believe someone like you loves someone like me"
  ],
  "quizQuestions": [
    {
      "question": "What's my favorite thing about you?",
      "options": ["Your smile", "Your laugh", "Everything", "Your kindness"],
      "answer": 2
    },
    {
      "question": "Who said 'I love you' first?",
      "options": ["Me", "You", "We said it together", "Still waiting..."],
      "answer": 0
    },
    {
      "question": "Our perfect date would be...",
      "options": ["Fancy dinner", "Movie night in", "Road trip", "Anywhere with you"],
      "answer": 3
    },
    {
      "question": "What food do we always fight over the last bite of?",
      "options": ["Pizza", "Ice cream", "Biryani", "We share everything"],
      "answer": 3
    },
    {
      "question": "Who's the bigger romantic?",
      "options": ["Definitely me", "Definitely you", "It's a tie", "We're both hopeless"],
      "answer": 3
    },
    {
      "question": "What's our love language?",
      "options": ["Words", "Quality time", "Acts of service", "All of the above"],
      "answer": 3
    },
    {
      "question": "Who picks the restaurant?",
      "options": ["Always me", "Always you", "We take turns", "We never agree so we order both"],
      "answer": 2
    },
    {
      "question": "What's the best gift I've ever given you?",
      "options": ["Something expensive", "Something handmade", "This app", "My heart (cheesy but true)"],
      "answer": 3
    },
    {
      "question": "Our song is special because...",
      "options": ["Great beat", "Romantic lyrics", "It was playing when we met", "We made it ours"],
      "answer": 3
    },
    {
      "question": "Who's more likely to plan a surprise?",
      "options": ["Me", "You", "We both love surprises", "Neither — we're bad at secrets"],
      "answer": 2
    },
    {
      "question": "What's our biggest inside joke about?",
      "options": ["Food", "Something silly we said once", "A movie quote", "All of the above"],
      "answer": 3
    },
    {
      "question": "Ideal weekend with you?",
      "options": ["Adventure outside", "Cozy at home", "Friends and fun", "Doesn't matter — just us"],
      "answer": 3
    },
    {
      "question": "Who texts 'good morning' first?",
      "options": ["Me", "You", "Whoever wakes up first", "We have a streak going"],
      "answer": 2
    },
    {
      "question": "What would we do on a rainy day?",
      "options": ["Stay in and cuddle", "Dance in the rain", "Movie marathon", "All sound perfect"],
      "answer": 3
    },
    {
      "question": "The most 'us' thing ever is...",
      "options": ["Late night talks", "Laughing at nothing", "Finishing each other's sentences", "All of the above"],
      "answer": 3
    }
  ],
  "wheelPrizes": [
    "Movie night — your pick!",
    "I cook dinner for you",
    "Unlimited hugs coupon",
    "A surprise date planned by me",
    "You win — I do whatever you want",
    "Ice cream run, on me",
    "Massage duty — 30 minutes",
    "Love letter delivered to your door",
    "Breakfast in bed",
    "You pick the next adventure",
    "Chai/coffee delivery to wherever you are",
    "A day where I say yes to everything",
    "Your favorite snack — I'll get it today",
    "Playlist made just for you",
    "Photo shoot date — I'll be the photographer",
    "No chores day — I handle everything",
    "Stargazing date planned by me",
    "Handwritten poem, delivered",
    "Shopping spree (small but sweet)",
    "Sleep in — I'll bring breakfast",
    "Dance party in the kitchen",
    "Back tickles until you fall asleep",
    "Choose the restaurant, I'll pay",
    "A whole day of 'your wish is my command'"
  ],
  "memorySymbols": ["💕", "🌹", "✨", "🦋", "🌙", "💌", "🎀", "☕", "🌸", "💫", "🎵", "🧸", "🌈", "💝", "🍰", "🌺"],
  "wouldYouRather": [
    {
      "a": "Forever cuddles on the couch",
      "b": "Spontaneous adventures every weekend",
      "reaction": "Both sound perfect with you honestly."
    },
    {
      "a": "Matching outfits day",
      "b": "Secret surprise date planned by me",
      "reaction": "I'd happily do either — or both!"
    },
    {
      "a": "Breakfast in bed",
      "b": "Late night drive with music",
      "reaction": "You always pick the coziest options."
    },
    {
      "a": "Rewatch our favorite movie",
      "b": "Try a brand new restaurant together",
      "reaction": "As long as we're together, I'm in."
    },
    {
      "a": "Dance in the kitchen",
      "b": "Stargazing on a blanket",
      "reaction": "Romantic either way. Come here."
    },
    {
      "a": "You pick the playlist",
      "b": "I pick the playlist",
      "reaction": "Fine, but we both know your taste wins."
    },
    {
      "a": "Beach sunset together",
      "b": "Mountain sunrise together",
      "reaction": "Sunrise or sunset — as long as it's with you."
    },
    {
      "a": "Cook together at home",
      "b": "Fancy dinner out",
      "reaction": "The company matters more than the menu."
    },
    {
      "a": "Text all day",
      "b": "One long call at night",
      "reaction": "I just want to hear from you — any way works."
    },
    {
      "a": "Big romantic gesture",
      "b": "Small everyday moments",
      "reaction": "It's the little things with you that hit hardest."
    },
    {
      "a": "Travel the world together",
      "b": "Build a cozy home together",
      "reaction": "Home or away — you're my destination."
    },
    {
      "a": "Win an argument",
      "b": "Make up faster",
      "reaction": "I'd rather be happy with you than right without you."
    },
    {
      "a": "Relive our first date",
      "b": "Skip to our wedding day",
      "reaction": "Every chapter with you is my favorite."
    },
    {
      "a": "You plan the date",
      "b": "I plan the date",
      "reaction": "Surprise me — or let me surprise you. Win-win."
    },
    {
      "a": "Pets: one dog",
      "b": "Pets: one cat",
      "reaction": "Honestly? Whatever makes you happy."
    }
  ],
  "truths": [
    "What's your favorite memory of us?",
    "When did you first know you liked me?",
    "What's one thing I do that always makes you smile?",
    "If we could teleport anywhere right now, where would we go?",
    "What's your secret nickname for me?",
    "What song reminds you of us?",
    "What's the sweetest thing I've ever done for you?",
    "What are you most excited about for our future?",
    "What was your first impression of me?",
    "What's your favorite thing about our relationship?",
    "If you could relive one day with me, which would it be?",
    "What's something I do that annoys you (nicely)?",
    "What's your dream date with me?",
    "When do you feel most loved by me?",
    "What's one thing you want us to try together?",
    "What's your favorite photo of us?",
    "What made you say yes to me?",
    "What's the funniest moment we've had?",
    "If we had a couple motto, what would it be?",
    "What's one thing about me that surprised you?",
    "Where do you see us in 5 years?",
    "What's your love language?",
    "What's the best advice you'd give to other couples?",
    "What do I do that makes you feel safe?",
    "What's one thing you've never told me but want to?"
  ],
  "dares": [
    "Send me the cutest selfie right now",
    "Voice note saying three things you love about me",
    "Plan our next date in one text message",
    "Do your best impression of me (kind version only!)",
    "Text me the emoji that describes us best",
    "Hum our song for 10 seconds on call",
    "Write one line of a love poem and send it",
    "Challenge me to a rematch on any game here",
    "Send a photo of what you're doing right now",
    "Record yourself saying 'I love you' in a funny voice",
    "Text me your most embarrassing childhood story",
    "Do 10 jumping jacks and send a video",
    "Send me your current screen time (no judgment!)",
    "Pick a random contact and say something nice about them",
    "Draw us as stick figures and send the picture",
    "Send me the last photo in your camera roll",
    "Type a love letter using only emojis",
    "Call me and say nothing for 5 seconds then hang up",
    "Send your best duck face selfie",
    "Text me what you're wearing right now (keep it PG!)",
    "Rate our relationship 1-10 and explain why",
    "Send a voice note singing happy birthday to me (it's not my birthday)",
    "Describe our first kiss in three words",
    "Send me a screenshot of your home screen",
    "Dare: let me pick your profile picture for 24 hours"
  ],
  "scratchPrizes": [
    "Free hug — redeem anytime",
    "You pick the movie tonight",
    "I owe you breakfast in bed",
    "One forehead kiss coupon",
    "You win — I'm yours for the evening",
    "Surprise snack delivery incoming",
    "30 min massage — no excuses",
    "Date night planned entirely by me",
    "Chai on me — your order, my treat",
    "Good morning text for a whole week",
    "I'll listen to your playlist all day",
    "One chore I'll do for you",
    "Compliment spam — 10 texts in a row",
    "Pick the restaurant next time",
    "Lazy day — zero responsibilities",
    "I'll send you a handwritten note",
    "Your favorite dessert — delivered",
    "One 'get out of argument free' card",
    "I'll plan a surprise within a week",
    "Unlimited cuddles for 24 hours"
  ]
}
$json$::jsonb,
  timezone('utc', now())
)
on conflict (id) do update set
  content = excluded.content,
  updated_at = excluded.updated_at;
