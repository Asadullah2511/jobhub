const { query } = require('../config/database');

const matchJobs = async (userProfile, jobType, searchWords = []) => {
  let sql = "SELECT * FROM jobs WHERE status = 'Active' AND type = $1";
  const params = [jobType];
  let paramIndex = 2;

  const isSearching = searchWords && searchWords.length > 0;

  if (isSearching) {
    const conditions = searchWords.map(word => {
      const likeClauses = ['title', 'location', 'description', 'skills']
        .map(col => `${col} ILIKE $${paramIndex}`);
      paramIndex++;
      params.push(`%${word}%`);
      return `(${likeClauses.join(' OR ')})`;
    });
    sql += ` AND (${conditions.join(' OR ')})`;
  }

  const result = await query(sql, params);
  const jobs = result.rows;

  let finalJobs;
  if (isSearching) {
    finalJobs = jobs;
  } else {
    finalJobs = jobs.filter(job => {
      if (jobType === 'blue') {
        return true;
      } else {
        return matchWhiteCollar(userProfile, job);
      }
    });
  }

  if (finalJobs.length > 0) {
    const employerIds = [...new Set(finalJobs.map(j => j.employer_id).filter(Boolean))];
    if (employerIds.length > 0) {
      const placeholders = employerIds.map((_, i) => `$${i + 1}`);
      const profResult = await query(
        `SELECT user_id, full_name, phone, company_name, bio, location, experience_years, skills, avg_rating, total_reviews
         FROM profiles WHERE user_id IN (${placeholders.join(',')})`,
        employerIds
      );
      const profileMap = {};
      profResult.rows.forEach(p => profileMap[p.user_id] = p);
      finalJobs.forEach(job => {
        job.profiles = profileMap[job.employer_id] || null;
      });
    }
  }

  return finalJobs;
};

const matchWhiteCollar = (profile, job) => {
  if (profile.role && typeof profile.role === 'string' && job.title) {
    const userRole = profile.role.toLowerCase();
    const jobTitle = String(job.title).toLowerCase();
    if (!jobTitle.includes(userRole)) {
      return false;
    }
  }

  const minYears = getMinYearsForLevel(job.experience_level);
  if (profile.experience_years !== undefined && profile.experience_years !== null) {
    if (profile.experience_years < minYears) {
      return false;
    }
  }

  return true;
};

const getMinYearsForLevel = (level) => {
  if (!level) return 0;
  const l = level.toLowerCase();
  if (l.includes('entry') || l.includes('junior')) return 0;
  if (l.includes('mid')) return 2;
  if (l.includes('senior') || l.includes('lead')) return 5;
  if (l.includes('expert') || l.includes('manager')) return 8;
  return 0;
};

module.exports = { matchJobs };
