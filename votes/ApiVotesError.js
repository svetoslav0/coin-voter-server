import { ApiError } from '../common/ApiError.js';

const ERRORS = {
    NON_EXISTING_COIN_VOTE: {
        status: 400,
        message: 'Cannot remove non-existing vote'
    },
    TOO_MANY_VOTES: {
        status: 429,
        message: 'Voting is possible only once on every {HOURS} hours'
    }
};

export class ApiVotesError extends ApiError {
    static get ERRORS() {
        return ERRORS;
    }
}
