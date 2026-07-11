import { Event, Category, CollegeInfo, College, Testimonial } from "@/types";

export const EVENTS: Event[] = [
  {
    id: "hackathon", 
    title: "Global Hackathon", 
    cat: "HACKATHON", 
    college: "IIT Bombay", 
    venue: "Tech Quad", 
    date: "Aug 22–24", 
    participants: "4,000+", 
    prize: "₹12L Prize Pool", 
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop", 
    sub: "48 hours. 4,000 builders. One campus turned into the biggest hack-night of the year — teams ship real products, judges are ex-founders, and the after-party doesn't stop till sunrise.", 
    badge: "b-blue",
    timeline: [
      { subtitle: "Day 1 · Morning", title: "Check-in & kits", desc: "Badge pickup, welcome kit, and campus orientation." },
      { subtitle: "Day 1 · Afternoon", title: "Opening ceremony", desc: "Kickoff talk and rules briefing on the main stage." },
      { subtitle: "Day 1 · Evening", title: "Hacking begins", desc: "Teams lock in ideas and start building." },
      { subtitle: "Day 2", title: "Mentor rounds", desc: "Rotating mentor check-ins and mid-way demos." },
      { subtitle: "Day 3", title: "Final demos & judging", desc: "Teams present to the judging panel." },
      { subtitle: "Closing", title: "Awards & wrap-up", desc: "Winners announced, prizes handed out, closing remarks." }
    ]
  },
  {id:"musicfest", title:"Neon Music Fest", cat:"MUSIC", college:"BITS Pilani", venue:"Open Air Arena", date:"Sep 5–6", participants:"9,500+", prize:"Headliner: Anonymous DJ", img:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop", sub:"Two nights, three stages, and a lineup built entirely around campus talent plus one surprise headliner nobody's naming yet.", badge:"b-pink"},
  {id:"startup", title:"Startup Sprint", cat:"STARTUP", college:"NMIMS Mumbai", venue:"Innovation Hall", date:"Sep 12", participants:"1,200+", prize:"₹8L Funding Pool", img:"https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop", sub:"Pitch a company in 72 hours flat. Real VCs sit on the panel, and the winning team walks out with a term sheet, not just a trophy.", badge:"b-orange"},
  {id:"dance", title:"Dance Nationals", cat:"DANCE", college:"Delhi University", venue:"Convocation Ground", date:"Sep 18–19", participants:"3,000+", prize:"₹5L + Nationals Trophy", img:"https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=1600&auto=format&fit=crop", sub:"Sixty crews, one floor, and a scoreboard that changes every round. This is the final stop before the national title is decided.", badge:"b-purple"},
  {id:"aisummit", title:"AI Builders Summit", cat:"AI", college:"IIT Delhi", venue:"CS Auditorium", date:"Sep 25", participants:"2,600+", prize:"Compute credits + mentorship", img:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1600&auto=format&fit=crop", sub:"A day of workshops and demos from students actually shipping AI products, followed by an open build-night with GPUs on tap.", badge:"b-cyan"},
  {id:"cricket", title:"Campus Cricket Cup", cat:"SPORTS", college:"Manipal University", venue:"Sports Complex", date:"Oct 2–4", participants:"5,000+ spectators", prize:"Inter-campus Trophy", img:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1600&auto=format&fit=crop", sub:"Sixteen colleges, three days, one trophy. Bring your college colors — the stands get loud for this one.", badge:"b-green"},
];

export const CATEGORIES: Category[] = [
  {name:"Hackathons", count:"1,240 events", icon:"💻", glow:"rgba(36,81,255,.4)"},
  {name:"Sports", count:"980 events", icon:"🏆", glow:"rgba(139,197,63,.4)"},
  {name:"Technical", count:"1,510 events", icon:"⚙️", glow:"rgba(215,255,61,.4)"},
  {name:"Music", count:"860 events", icon:"🎧", glow:"rgba(255,75,51,.4)"},
  {name:"Dance", count:"640 events", icon:"💃", glow:"rgba(255,216,77,.4)"},
  {name:"Gaming", count:"1,110 events", icon:"🎮", glow:"rgba(215,255,61,.4)"},
  {name:"Startup", count:"470 events", icon:"🚀", glow:"rgba(249,115,22,.4)"},
  {name:"Robotics", count:"390 events", icon:"🤖", glow:"rgba(36,81,255,.4)"},
];

export const COLLEGE_INFO: Record<string, CollegeInfo> = {
  "IIT Bombay": {loc:"Powai, Mumbai, India", founded:"1958", students:"11,000", events:"340", img:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop", about:"One of India's premier engineering institutes, known for its buzzing tech culture and a campus that turns into a 24-hour build lab every fest season.", gallery:["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=400&auto=format&fit=crop"], past:[{name:"Techfest 2025", icon:"⚡", type:"Flagship · 90k attendees"},{name:"Robotics Rumble", icon:"🤖", type:"Technical · 2,200 teams"},{name:"Mood Indigo Prelude", icon:"🎨", type:"Cultural · 15k footfall"}]},
  "BITS Pilani": {loc:"Pilani, Rajasthan, India", founded:"1964", students:"9,000", events:"280", img:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop", about:"A desert campus with an outsized reputation for its annual cultural fest, Oasis — three days that turn Pilani into the loudest town in Rajasthan.", gallery:["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=401&auto=format&fit=crop"], past:[{name:"Oasis 2025", icon:"🎪", type:"Cultural · 60k attendees"},{name:"Apogee", icon:"🔬", type:"Technical · 8,000 teams"},{name:"Battle of Bands", icon:"🎸", type:"Music · 40 colleges"}]},
  "NMIMS Mumbai": {loc:"Vile Parle, Mumbai, India", founded:"1981", students:"6,500", events:"190", img:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop", about:"A management-first campus that treats its startup and business fests as seriously as a real accelerator demo day.", gallery:["https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop"], past:[{name:"Umang Business Fest", icon:"📈", type:"Startup · 3,000 attendees"},{name:"Case Crunch Finals", icon:"📊", type:"Case comp · 400 teams"},{name:"Founders' Night", icon:"🚀", type:"Networking · 800 founders"}]},
  "Delhi University": {loc:"North Campus, Delhi, India", founded:"1922", students:"18,000", events:"410", img:"https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=800&auto=format&fit=crop", about:"India's largest and oldest campus culture hub — every college within DU runs its own fest, making the calendar packed year-round.", gallery:["https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1508997449629-303059a039c0?q=80&w=400&auto=format&fit=crop"], past:[{name:"Antardhwani 2025", icon:"🎭", type:"Cultural · 25k attendees"},{name:"Ritmo Dance Meet", icon:"💃", type:"Dance · 55 crews"},{name:"Crossroads Fest", icon:"🎶", type:"Music · 30k attendees"}]},
  "IIT Delhi": {loc:"Hauz Khas, Delhi, India", founded:"1961", students:"8,900", events:"260", img:"https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=800&auto=format&fit=crop", about:"A research-heavy campus where the AI and robotics labs spill straight into student-run summits and open build-nights.", gallery:["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop"], past:[{name:"Rendezvous 2025", icon:"🎉", type:"Flagship · 50k attendees"},{name:"ML Summer School", icon:"🧠", type:"Technical · 1,000 attendees"},{name:"Open Source Day", icon:"💻", type:"Hackathon · 600 devs"}]},
  "Manipal University": {loc:"Manipal, Karnataka, India", founded:"1953", students:"14,000", events:"300", img:"https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop", about:"A sprawling multi-disciplinary campus with a sports culture that fills stands for even the inter-hostel matches.", gallery:["https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop"], past:[{name:"Manipal Sports Meet 2025", icon:"🏅", type:"Sports · 12k spectators"},{name:"Revels Cultural Fest", icon:"🎊", type:"Cultural · 20k attendees"},{name:"Kar-Manipal Cup", icon:"🏏", type:"Cricket · 16 colleges"}]},
};

export const COLLEGES: College[] = [
  {name:"IIT Bombay", loc:"Mumbai, India", events:"340", students:"11k", img:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"},
  {name:"BITS Pilani", loc:"Pilani, India", events:"280", students:"9k", img:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop"},
  {name:"Delhi University", loc:"Delhi, India", events:"410", students:"18k", img:"https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop"},
];

export const TESTIMONIALS: Testimonial[] = [
  {quote:"Found the AI summit through CollegeEvents two days before it happened, showed up solo, left with a team and a mentor.", name:"Aarav Mehta", role:"BTech CSE, IIT Delhi", avatar:"https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop"},
  {quote:"The event carousel is genuinely the only reason I know what's happening on other campuses, not just mine.", name:"Simran Kaur", role:"Design, NID Ahmedabad", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"},
  {quote:"Registered for Nationals in under a minute on my phone between classes. No app has ever felt this fast.", name:"Rohan Iyer", role:"Dance Society Lead, DU", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"},
  {quote:"As an organizer, our sign-ups tripled the week we listed on here. The reach across colleges is unmatched.", name:"Priya Nair", role:"Fest Coordinator, BITS Pilani", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"},
];
