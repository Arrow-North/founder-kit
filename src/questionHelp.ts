// "Need help?" content for each question: guiding questions plus tap-to-fill examples.
// Examples deliberately use different product ideas so no single idea is suggested.

export interface QuestionHelp {
  guiding: string[];
  examples: string[];
}

export const QUESTION_HELP: Record<string, QuestionHelp> = {
  q1: {
    guiding: [
      'Who is it for?',
      'What problem does it solve?',
      'If a friend asked what it does, what would you say?'
    ],
    examples: [
      'An app that lets dog walkers book, track and get paid for walks in one place.',
      'A tool that helps teachers grade short written answers faster.',
      'A pre-order page for small bakeries so they know what to bake each morning.',
      'A simple way for freelancers to send invoices and chase late payments.'
    ]
  },
  q2: {
    guiding: [
      'What are they doing when this problem shows up?',
      "What's their job or situation when this happens?",
      'Can you picture one real person who fits?'
    ],
    examples: [
      'Solo dog walkers with 10 to 20 regular clients, juggling texts and a paper calendar.',
      'Middle school English teachers grading 120 short essays every week.',
      'Owners of one-shop bakeries who bake before dawn and guess the day’s demand.',
      'Freelance designers who bill five to ten clients a month on their own.'
    ]
  },
  q3: {
    guiding: [
      'How often does this happen?',
      'What does it cost them: time, money, or something else?',
      'What do they complain about when it goes wrong?'
    ],
    examples: [
      'Double-booked walks and missed payments every week, which costs them clients.',
      'Grading eats their evenings and weekends, so feedback reaches students late.',
      'They throw away unsold bread most days and run out of best sellers by 10am.',
      'Chasing late invoices takes hours each month, and some never get paid.'
    ]
  },
  q4: {
    guiding: [
      'What do they use today: a tool, a spreadsheet, a person?',
      'Is it working for them?',
      'What breaks down when they use it?'
    ],
    examples: [
      'Group texts, a shared Google Calendar and Venmo requests.',
      'A rubric printed on paper and a pile of sticky notes.',
      'Taking orders by phone and writing them on a whiteboard.',
      'A spreadsheet of invoices and reminder emails they write by hand.'
    ]
  },
  q5: {
    guiding: [
      "What's the first thing they'd use it for?",
      'What does it replace?',
      'What is the one thing it must do well?'
    ],
    examples: [
      'Clients book a walk from a link, and the walker gets one schedule and automatic payment.',
      'It suggests a grade and a comment for each answer, and the teacher approves or edits.',
      'Customers pre-order by 8pm, and the baker gets a bake list for the next morning.',
      'It sends the invoice, follows up on its own and shows who still owes what.'
    ]
  },
  q6: {
    guiding: [
      'How would they describe that to someone else?',
      "What can they do that they couldn't before?",
      'What does a good week look like for them after?'
    ],
    examples: [
      'They take on more clients without more admin, and stop losing money to no-shows.',
      'They finish grading during school hours and get their evenings back.',
      'They bake what sells, waste less and stop turning customers away.',
      'They get paid on time without awkward follow-up emails.'
    ]
  },
  q7: {
    guiding: [
      'Is it about whether enough people have this problem?',
      "Is it about whether they'd pay for it?",
      'Is it about whether they would change how they work today?'
    ],
    examples: [
      'Whether walkers would pay a monthly fee or expect it to be free.',
      'Whether teachers would trust a suggested grade.',
      'Whether bakery customers would actually order the night before.',
      'Whether freelancers would switch from the tools they already use.'
    ]
  }
};
