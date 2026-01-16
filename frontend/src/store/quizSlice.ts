import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuizState {
  quizzes: Array<{ id: number; title: string; description: string }>;
  currentQuiz: { id: number; title: string; description: string } | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    fetchQuizzesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchQuizzesSuccess(state, action: PayloadAction<Array<{ id: number; title: string; description: string }>>) {
      state.loading = false;
      state.quizzes = action.payload;
    },
    fetchQuizzesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentQuiz(state, action: PayloadAction<{ id: number; title: string; description: string } | null>) {
      state.currentQuiz = action.payload;
    },
  },
});

export const {
  fetchQuizzesStart,
  fetchQuizzesSuccess,
  fetchQuizzesFailure,
  setCurrentQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;