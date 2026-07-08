#!/bin/bash

TOKEN=$(curl -X POST http://192.168.1.126:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"employer1","password":"emp123"}' \
  -s | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Creating 10 sample jobs..."

# Job 1
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Senior Software Engineer",
    "description": "Looking for experienced software engineer with React Native and Node.js skills",
    "type": "white",
    "location": "Karachi, Pakistan",
    "salary_range": "150000-250000",
    "skills": "React Native, Node.js, PostgreSQL, AWS",
    "experience_level": "Senior",
    "availability": "Full-time"
  }' -s > /dev/null && echo "✓ Job 1 created"

# Job 2
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Electrician",
    "description": "Experienced electrician needed for residential projects",
    "type": "blue",
    "location": "Lahore, Pakistan",
    "hourly_rate": "2000",
    "skills": "Electrical wiring, Circuit installation, Troubleshooting",
    "experience_level": "Mid-level",
    "availability": "Contract"
  }' -s > /dev/null && echo "✓ Job 2 created"

# Job 3
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Plumber",
    "description": "Skilled plumber for commercial building maintenance",
    "type": "blue",
    "location": "Islamabad, Pakistan",
    "hourly_rate": "1800",
    "skills": "Pipe fitting, Drainage systems, Repair work",
    "experience_level": "Mid-level",
    "availability": "Full-time"
  }' -s > /dev/null && echo "✓ Job 3 created"

# Job 4
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Carpenter",
    "description": "Expert carpenter for furniture making and installation",
    "type": "blue",
    "location": "Karachi, Pakistan",
    "hourly_rate": "1500",
    "skills": "Wood working, Furniture design, Installation",
    "experience_level": "Senior",
    "availability": "Contract"
  }' -s > /dev/null && echo "✓ Job 4 created"

# Job 5
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Data Analyst",
    "description": "Analyze business data and create insights",
    "type": "white",
    "location": "Karachi, Pakistan",
    "salary_range": "80000-120000",
    "skills": "Python, SQL, Data Visualization, Excel",
    "experience_level": "Mid-level",
    "availability": "Full-time"
  }' -s > /dev/null && echo "✓ Job 5 created"

# Job 6
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Painter",
    "description": "Professional painter for interior and exterior work",
    "type": "blue",
    "location": "Lahore, Pakistan",
    "hourly_rate": "1200",
    "skills": "Interior painting, Exterior painting, Surface preparation",
    "experience_level": "Junior",
    "availability": "Contract"
  }' -s > /dev/null && echo "✓ Job 6 created"

# Job 7
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Web Developer",
    "description": "Full stack web developer for startup project",
    "type": "white",
    "location": "Remote",
    "salary_range": "100000-180000",
    "skills": "React, Node.js, MongoDB, REST APIs",
    "experience_level": "Mid-level",
    "availability": "Full-time"
  }' -s > /dev/null && echo "✓ Job 7 created"

# Job 8
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Construction Worker",
    "description": "General construction labor for building project",
    "type": "blue",
    "location": "Islamabad, Pakistan",
    "hourly_rate": "1000",
    "skills": "Construction, Heavy lifting, Equipment operation",
    "experience_level": "Junior",
    "availability": "Contract"
  }' -s > /dev/null && echo "✓ Job 8 created"

# Job 9
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Marketing Manager",
    "description": "Lead marketing campaigns and team management",
    "type": "white",
    "location": "Karachi, Pakistan",
    "salary_range": "120000-200000",
    "skills": "Digital Marketing, SEO, Team Management, Analytics",
    "experience_level": "Senior",
    "availability": "Full-time"
  }' -s > /dev/null && echo "✓ Job 9 created"

# Job 10
curl -X POST http://192.168.1.126:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Mechanic",
    "description": "Auto mechanic for repair shop",
    "type": "blue",
    "location": "Lahore, Pakistan",
    "hourly_rate": "1600",
    "skills": "Engine repair, Diagnostics, Maintenance",
    "experience_level": "Mid-level",
    "availability": "Full-time"
  }' -s > /dev/null && echo "✓ Job 10 created"

echo "✅ All jobs created successfully!"

# Verify
echo ""
echo "Fetching jobs..."
curl -s http://192.168.1.126:5000/api/jobs/public | grep -o '"total":[0-9]*'
