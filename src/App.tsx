import React, { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { QuestionScreen, Question } from './components/QuestionScreen';
import { EmailCaptureScreen } from './components/EmailCaptureScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsScreen } from './components/ResultsScreen';

const QUESTIONS: Question[] = [
{
  id: 'q1',
  label: 'Q1',
  question: "What's your idea?",
  subtext: 'One to two sentences. What does it do.',
  probing: ['Who is it for?', 'What problem does it solve?']
},
{
  id: 'q2',
  label: 'Q2',
  question: 'Who specifically has this problem?',
  subtext: 'Role and situation, not demographics.',
  probing: [
  'What are they doing when this problem shows up?',
  "What's their job or situation when this happens?"]

},
{
  id: 'q3',
  label: 'Q3',
  question: "What's the pain point?",
  subtext: "The specific frustration or cost they're experiencing.",
  probing: [
  'How often does this happen?',
  'What does it cost them: time, money, or something else?']

},
{
  id: 'q4',
  label: 'Q4',
  question: "What's their current workaround or hack?",
  subtext: 'What they do today without your solution.',
  probing: ['Is it working for them?', 'What breaks down when they use it?']
},
{
  id: 'q5',
  label: 'Q5',
  question: 'What does your solution actually do for them?',
  subtext: 'The functional thing it delivers.',
  probing: [
  "What's the first thing they'd use it for?",
  'What does it replace?']

},
{
  id: 'q6',
  label: 'Q6',
  question: 'What changes for them when they have it?',
  subtext: 'The outcome. What their work or life looks like after.',
  probing: [
  'How would they describe that to someone else?',
  "What can they do that they couldn't before?"]

},
{
  id: 'q7',
  label: 'Q7',
  question: 'What are you most unsure about?',
  subtext: 'The thing keeping you from feeling confident this will work.',
  probing: [
  'Is it about whether enough people have this problem?',
  "Is it about whether they'd pay for it?"]

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
'loading' |
'results';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('q1');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const createSubmission = useMutation(api.submissions.createSubmission);

  // Document generation with real AI and exponential backoff
  const createValidationDoc = useAction(api.documentGeneration.createValidationDoc);
  const createVibeCodingPrompt = useAction(api.documentGeneration.createVibeCodingPrompt);
  const createUxPlaybook = useAction(api.documentGeneration.createUxPlaybook);

  // Email sending
  const sendFounderKitEmailWithDocs = useAction(api.email.sendFounderKitEmailWithDocs);

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
    setEmail(submittedEmail);
    setFirstName(submittedFirstName);
    setLastName(submittedLastName);

    // Move to loading screen immediately
    setCurrentScreen('loading');

    // Helper function for exponential backoff delay
    const exponentialDelay = async (attemptNumber: number, baseDelay: number = 5000) => {
      const delay = baseDelay * Math.pow(2, attemptNumber);
      console.log(`⏳ Waiting ${delay / 1000}s before next generation (exponential backoff)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    };

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

      // Step 1: Save submission to database
      console.log('Saving submission...');
      await createSubmission({
        firstName: submittedFirstName,
        lastName: submittedLastName,
        email: submittedEmail,
        answers: answersData,
      });
      console.log('✓ Submission saved successfully!');

      let currentAttempt = 0;
      let allDocsGenerated = false;

      while (!allDocsGenerated && currentAttempt < 3) {
        try {
          // Step 2: Generate Validation Document
          console.log(`\n📄 Generating validation document (attempt ${currentAttempt + 1}/3)...`);
          await createValidationDoc({
            userId: submittedEmail,
            answers: answersData,
          });
          console.log('✓ Validation document generated!');

          // Wait before next call (exponential backoff)
          await exponentialDelay(currentAttempt, 5000); // 5s, 10s, 20s

          // Step 3: Generate Vibe Coding Prompts
          console.log(`\n💻 Generating vibe coding prompts (attempt ${currentAttempt + 1}/3)...`);
          await createVibeCodingPrompt({
            userId: submittedEmail,
            answers: answersData,
          });
          console.log('✓ Vibe coding prompts generated!');

          // Wait before next call (exponential backoff)
          await exponentialDelay(currentAttempt, 5000); // 5s, 10s, 20s

          // Step 4: Generate UX Playbook
          console.log(`\n🎨 Generating UX playbook (attempt ${currentAttempt + 1}/3)...`);
          await createUxPlaybook({
            userId: submittedEmail,
            answers: answersData,
          });
          console.log('✓ UX playbook generated!');

          allDocsGenerated = true;
          console.log('\n🎉 All documents generated successfully!');

          // Send email with document links
          try {
            console.log('\n📧 Sending email with documents...');

            // Wait a moment to ensure all documents are fully committed to storage
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Send email with document URLs (fetched automatically)
            await sendFounderKitEmailWithDocs({
              userId: submittedEmail,
              firstName: submittedFirstName,
              lastName: submittedLastName,
            });

            console.log('✓ Email sent successfully with document links!');

          } catch (emailError: any) {
            console.error('⚠️ Error sending email (documents still generated):', emailError.message);
            // Continue anyway - documents are generated even if email fails
          }
        } catch (error: any) {
          currentAttempt++;
          console.error(`\n❌ Error on attempt ${currentAttempt}:`, error.message);

          if (currentAttempt < 3) {
            const retryDelay = 15000 * Math.pow(2, currentAttempt - 1); // 15s, 30s
            console.log(`\n🔄 Retrying all documents in ${retryDelay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          } else {
            console.error('\n❌ All retry attempts exhausted');
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('\n❌ Final error after all attempts:', error);
      alert('There was an error generating your documents. Please check the console. You may need to wait a few minutes due to API rate limits, or use test mode.');
    }
  };

  const handleLoadingComplete = () => {
    setCurrentScreen('results');
  };

  const handleStartOver = () => {
    setAnswers({});
    setEmail('');
    setFirstName('');
    setLastName('');
    setCurrentScreen('q1');
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
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      case 'results':
        return <ResultsScreen onStartOver={handleStartOver} userId={email} answers={answers} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[390px] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto min-h-screen bg-brand-dark shadow-2xl overflow-hidden relative">
      {renderScreen()}
    </div>);

}