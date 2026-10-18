import React, { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { QuestionScreen, Question } from './components/QuestionScreen';
import { EmailCaptureScreen } from './components/EmailCaptureScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { navigate } from './router';

const QUESTIONS: Question[] = [
{
  id: 'q1',
  label: 'Q1',
  question: "What's your idea?",
  subtext: 'One to two sentences. What does it do.'
},
{
  id: 'q2',
  label: 'Q2',
  question: 'Who specifically has this problem?',
  subtext: 'Role and situation, not demographics.'
},
{
  id: 'q3',
  label: 'Q3',
  question: "What's the pain point?",
  subtext: "The specific frustration or cost they're experiencing."
},
{
  id: 'q4',
  label: 'Q4',
  question: "What's their current workaround or hack?",
  subtext: 'What they do today without your solution.'
},
{
  id: 'q5',
  label: 'Q5',
  question: 'What does your solution actually do for them?',
  subtext: 'The functional thing it delivers.'
},
{
  id: 'q6',
  label: 'Q6',
  question: 'What changes for them when they have it?',
  subtext: 'The outcome. What their work or life looks like after.'
},
{
  id: 'q7',
  label: 'Q7',
  question: 'What are you most unsure about?',
  subtext: 'The thing keeping you from feeling confident this will work.'
}];


type ScreenState =
'q1' |
'q2' |
'q3' |
'q4' |
'q5' |
'q6' |
'q7' |
'email' |
'loading';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('q1');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Saves the submission and starts kit generation on the server
  const startKit = useAction(api.kits.startKit);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextQuestion = () => {
    const qIndex = parseInt(currentScreen.replace('q', '')) - 1;
    if (qIndex < 6) {
      setCurrentScreen(`q${qIndex + 2}` as ScreenState);
    } else {
      setCurrentScreen('email');
    }
  };

  const handleBackQuestion = () => {
    const qIndex = parseInt(currentScreen.replace('q', '')) - 1;
    if (qIndex > 0) {
      setCurrentScreen(`q${qIndex}` as ScreenState);
    }
  };

  const handleEmailSubmit = async (submittedEmail: string, submittedFirstName: string, submittedLastName: string) => {
    // Move to loading screen immediately
    setCurrentScreen('loading');

    try {
      // Prepare the answers object
      const answersData = {
        q1: answers.q1 || '',
        q2: answers.q2 || '',
        q3: answers.q3 || '',
        q4: answers.q4 || '',
        q5: answers.q5 || '',
        q6: answers.q6 || '',
        q7: answers.q7 || '',
      };

      // One server call: saves the submission and schedules generation
      const { kitId } = await startKit({
        firstName: submittedFirstName,
        lastName: submittedLastName,
        email: submittedEmail,
        answers: answersData,
      });
      console.log('✓ Kit started:', kitId);
      navigate(`/kit/${kitId}`);
    } catch (error) {
      console.error('❌ Error starting kit:', error);
      alert('There was an error starting your kit. Please try again in a moment.');
    }
  };

  const renderScreen = () => {
    if (currentScreen.startsWith('q')) {
      const qIndex = parseInt(currentScreen.replace('q', '')) - 1;
      const question = QUESTIONS[qIndex];
      return (
        <QuestionScreen
          question={question}
          questionIndex={qIndex}
          totalQuestions={QUESTIONS.length}
          value={answers[question.id] || ''}
          onChange={(val) => handleAnswerChange(question.id, val)}
          onNext={handleNextQuestion}
          onBack={handleBackQuestion} />);


    }
    switch (currentScreen) {
      case 'email':
        return <EmailCaptureScreen onSubmit={handleEmailSubmit} />;
      case 'loading':
        return <LoadingScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[390px] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto min-h-screen bg-brand-dark shadow-2xl overflow-hidden relative">
      {renderScreen()}
    </div>);

}