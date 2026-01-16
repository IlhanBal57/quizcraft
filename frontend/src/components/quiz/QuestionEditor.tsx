import React, { useState } from 'react';

const QuestionEditor = ({ question, onSave }) => {
    const [prompt, setPrompt] = useState(question.prompt || '');
    const [options, setOptions] = useState({
        a: question.option_a || '',
        b: question.option_b || '',
        c: question.option_c || '',
        d: question.option_d || '',
    });
    const [correctKey, setCorrectKey] = useState(question.correct_key || '');
    const [explanation, setExplanation] = useState(question.explanation || '');
    const [imageUrl, setImageUrl] = useState(question.image_url || '');

    const handleOptionChange = (key, value) => {
        setOptions((prevOptions) => ({
            ...prevOptions,
            [key]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedQuestion = {
            prompt,
            option_a: options.a,
            option_b: options.b,
            option_c: options.c,
            option_d: options.d,
            correct_key: correctKey,
            explanation,
            image_url: imageUrl,
        };
        onSave(updatedQuestion);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Question Prompt:</label>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Option A:</label>
                <input
                    type="text"
                    value={options.a}
                    onChange={(e) => handleOptionChange('a', e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Option B:</label>
                <input
                    type="text"
                    value={options.b}
                    onChange={(e) => handleOptionChange('b', e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Option C:</label>
                <input
                    type="text"
                    value={options.c}
                    onChange={(e) => handleOptionChange('c', e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Option D:</label>
                <input
                    type="text"
                    value={options.d}
                    onChange={(e) => handleOptionChange('d', e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Correct Option Key:</label>
                <input
                    type="text"
                    value={correctKey}
                    onChange={(e) => setCorrectKey(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Explanation:</label>
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                />
            </div>
            <div>
                <label>Image URL:</label>
                <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </div>
            <button type="submit">Save Question</button>
        </form>
    );
};

export default QuestionEditor;