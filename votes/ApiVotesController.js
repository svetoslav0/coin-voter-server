import { CONSTANTS } from '../common/config/CONSTANTS.js';
import { ApiController } from '../common/ApiController.js';
import { ApiVotesError } from './ApiVotesError.js';

export class ApiVotesController extends ApiController {
    /**
     * @param vote
     * @returns {boolean}
     */
    static can_vote_again(vote) {
        const voting_time = vote.time_voted;
        const hoursDiff =
            Math.abs(new Date() - new Date(voting_time)) / ApiController.MILLISECONDS_TO_HOURS_COEFFICIENT;

        return hoursDiff >= CONSTANTS.RESTRICTIONS.VOTES_QUOTA_HOURS;
    }

    /**
     * @returns {Promise<{success: boolean}>}
     */
    async add_vote() {
        await this._validate_coin_id_param_and_get_coin();
        const coin_id = this._request.params.id;
        const user_id = this._request.user_id;

        const vote = await this._repository.votes.get_last_vote(user_id, coin_id);

        this._validate_vote_action(vote);
        await this._repository.votes.add(user_id, coin_id);

        return {
            success: true
        };
    }

    /**
     * @returns {Promise<{success: boolean}>}
     */
    async remove_last_vote() {
        await this._validate_coin_id_param_and_get_coin();
        const coin_id = this._request.params.id;
        const user_id = this._request.user_id;

        const vote = await this._repository.votes.get_last_vote(user_id, coin_id);
        if (!vote) {
            throw new ApiVotesError(ApiVotesError.ERRORS.NON_EXISTING_COIN_VOTE);
        }

        await this._repository.votes.remove(vote.id);
        return {
            success: true
        };
    }

    /**
     * @param vote
     * @private
     */
    _validate_vote_action(vote) {
        if (vote && !ApiVotesController.can_vote_again(vote)) {
            throw new ApiVotesError(
                ApiVotesError.ERRORS.TOO_MANY_VOTES,
                { HOURS: CONSTANTS.RESTRICTIONS.VOTES_QUOTA_HOURS }
            );
        }
    }
}
