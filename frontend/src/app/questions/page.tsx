import { redirect } from 'next/navigation';

export default function QuestionsRedirect() {
  redirect('/?tab=questions');
}
