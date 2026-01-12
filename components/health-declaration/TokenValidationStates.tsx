import { useNavigate } from 'react-router-dom';
import { Loader2, XCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button, Card } from '../ui';

type LoadingStateProps = {
  lang: 'he' | 'en';
};

export const LoadingState = ({ lang }: LoadingStateProps) => {
  const t = (he: string, en: string) => lang === 'he' ? he : en;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('מאמת גישה...', 'Verifying access...')}</h2>
        <p className="text-gray-500">{t('אנא המתן/י בזמן שאנו מאמתים את הקישור', 'Please wait while we verify your link')}</p>
      </Card>
    </div>
  );
};

type ErrorStateProps = {
  lang: 'he' | 'en';
  reason?: string;
};

export const ErrorState = ({ lang, reason }: ErrorStateProps) => {
  const navigate = useNavigate();
  const t = (he: string, en: string) => lang === 'he' ? he : en;

  const getErrorContent = () => {
    switch (reason) {
      case 'TOKEN_NOT_FOUND':
      case 'NO_TOKEN':
        return {
          icon: <XCircle size={48} strokeWidth={2} />,
          title: t('קישור לא תקין', 'Invalid Link'),
          description: t(
            'הקישור אינו תקין או שפג תוקפו. אנא פנה למרפאה לקבלת קישור חדש.',
            'This link is invalid or has expired. Please contact the clinic for a new link.'
          ),
          color: 'red'
        };
      case 'TOKEN_ALREADY_USED':
        return {
          icon: <CheckCircle2 size={48} strokeWidth={2} />,
          title: t('הטופס כבר הוגש', 'Form Already Submitted'),
          description: t(
            'הצהרת הבריאות כבר הוגשה באמצעות קישור זה. אם יש צורך בהצהרה נוספת, אנא פנה למרפאה.',
            'The health declaration has already been submitted using this link. For a new declaration, please contact the clinic.'
          ),
          color: 'yellow'
        };
      case 'TOKEN_EXPIRED':
        return {
          icon: <Clock size={48} strokeWidth={2} />,
          title: t('פג תוקף הקישור', 'Link Expired'),
          description: t(
            'תוקף הקישור פג. אנא פנה למרפאה לקבלת קישור חדש.',
            'This link has expired. Please contact the clinic for a new link.'
          ),
          color: 'orange'
        };
      default:
        return {
          icon: <AlertCircle size={48} strokeWidth={2} />,
          title: t('שגיאה', 'Error'),
          description: t('אירעה שגיאה. אנא נסה שוב מאוחר יותר.', 'An error occurred. Please try again later.'),
          color: 'red'
        };
    }
  };

  const error = getErrorContent();
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  }[error.color] || 'bg-red-50 text-red-600';

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-500">
        <div className={`w-20 h-20 ${colorClasses} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {error.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error.title}</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">{error.description}</p>
        <Button onClick={() => navigate('/')} variant="outline" className="w-full h-12">
          {t('חזרה לעמוד הבית', 'Back to Home')}
        </Button>
      </Card>
    </div>
  );
};

type SuccessStateProps = {
  lang: 'he' | 'en';
};

export const SuccessState = ({ lang }: SuccessStateProps) => {
  const navigate = useNavigate();
  const t = (he: string, en: string) => lang === 'he' ? he : en;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('תודה רבה!', 'Thank You!')}</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          {t('הצהרת הבריאות שלך נקלטה בהצלחה במערכת.', 'Your health declaration has been submitted successfully.')}
        </p>
        <Button onClick={() => navigate('/')} className="w-full h-12 text-lg">
          {t('סיום', 'Done')}
        </Button>
      </Card>
    </div>
  );
};
