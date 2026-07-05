const jobService = require('../services/jobService');
const aiSearchMapper = require('../utils/aiSearchMapper');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, created, paginated } = require('../utils/responseHelper');

exports.createJob = asyncHandler(async (req, res) => {
    const {
        title, description, type, location,
        salary_range, hourly_rate, duration,
        skills, experience_level, availability,
        latitude, longitude
    } = req.body;

    const employer_id = req.user.id;

    const jobData = {
        employer_id, title, description, type, location,
        salary_range, hourly_rate, duration, skills,
        experience_level, availability,
        latitude, longitude
    };

    const job = await jobService.createJob(jobData);
    return created(res, job, 'Job posted successfully');
});

exports.getJobs = asyncHandler(async (req, res) => {
    const { type, search, page = 1, limit = 20 } = req.query;

    let searchWords = [];
    if (search && search.trim().length > 0) {
        searchWords = await aiSearchMapper.getSemanticJobTitles(search);
    }

    const data = await jobService.getJobs(type, searchWords, { page: parseInt(page), limit: parseInt(limit) });

    if (data.pagination) {
        return paginated(res, data.jobs, data.pagination);
    }

    return success(res, data);
});

exports.deleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employer_id = req.user.id;

    await jobService.deleteJob(id, employer_id);
    return success(res, null, 'Job deleted successfully');
});

exports.getMatchedJobs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, search } = req.query;

    let searchWords = [];
    if (search && search.trim() !== '') {
        searchWords = await aiSearchMapper.getSemanticJobTitles(search);
    }

    const matches = await jobService.getMatchedJobs(userId, type, searchWords);
    return success(res, matches, 'Matched jobs retrieved successfully');
});

exports.getNearbyJobs = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 10, search } = req.query;

    let searchWords = [];
    if (search && search.trim() !== '') {
        searchWords = await aiSearchMapper.getSemanticJobTitles(search);
    }

    const nearbyJobs = await jobService.getNearbyJobs(lat, lng, radius, searchWords);
    return success(res, nearbyJobs, 'Nearby jobs retrieved successfully');
});

exports.applyForJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const applicant_id = req.user.id;
    const { resume_url, cover_letter } = req.body;

    const application = await jobService.applyForJob(id, applicant_id, resume_url, cover_letter);
    return created(res, application, 'Application submitted successfully');
});

exports.getMyJobs = asyncHandler(async (req, res) => {
    const employer_id = req.user.id;
    const data = await jobService.getMyJobs(employer_id);
    return success(res, data, 'Your jobs retrieved successfully');
});

exports.getJobApplications = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employer_id = req.user.id;

    const enrichedApps = await jobService.getJobApplications(id, employer_id);
    return success(res, enrichedApps, 'Job applications retrieved successfully');
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const application = await jobService.updateApplicationStatus(id, userId, status);
    return success(res, application, 'Application status updated successfully');
});

exports.getWorkerApplications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const data = await jobService.getWorkerApplications(userId);
    return success(res, data, 'Your applications retrieved successfully');
});
