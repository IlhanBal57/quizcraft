import { useEffect, useState } from 'react';
import { fetchQuizResults } from '../api';

const useResults = (quizId) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getResults = async () => {
            try {
                const data = await fetchQuizResults(quizId);
                setResults(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            getResults();
        }
    }, [quizId]);

    return { results, loading, error };
};

export default useResults;