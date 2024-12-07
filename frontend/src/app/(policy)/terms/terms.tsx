import { Separator } from '@/components/ui/separator';

export default function TermsContent() {
  return (
    <>
      <h2>Terms of Service for Measurely</h2>
      <Separator className="my-5" />
      <br />
      <p>
        Welcome to Measurely! By accessing or using our service, you agree to
        these Terms of Service ("Terms"). Please read them carefully. If you
        have any questions, contact us at info@measurely.dev.
      </p>
      <br />
      <br />
      <h3>Service Overview</h3>
      <br />
      <p>
        Measurely is an online dashboard that helps users track and analyze
        their metrics. Users with an API key can connect their functions or
        systems to Measurely, allowing them to send data for real-time
        monitoring and analysis.
      </p>
      <br />
      <br />
      <h3>Eligibility</h3>
      <br />
      <p>
        Measurely does not have an age restriction, but because payment is
        involved, we recommend that users be of legal age in their jurisdiction
        to enter into contracts. By using the service, you confirm that you meet
        this requirement.
      </p>
      <br />
      <br />
      <h3>Account Registration</h3>
      <br />
      <p>
        To use Measurely, you must register an account by providing your email
        address, first name, last name, and a password. You are responsible for
        maintaining the confidentiality of your account credentials. Measurely
        is not responsible for any unauthorized access to your account due to
        your failure to safeguard your credentials.
      </p>
      <br />
      <br />
      <h3>User Responsibilities</h3>
      <br />
      <p>
        By using Measurely, you agree not to:
      </p>
      <ul className="list-inside list-disc">
        <li>Use the service to spam or send unauthorized messages.</li>
        <li>Engage in illegal activities or use the service for unlawful purposes.</li>
        <li>Interfere with or disrupt the Measurely platform or servers.</li>
      </ul>
      <p>
        You may share your API key or account with others, but you are
        responsible for all activities conducted under your account.
      </p>
      <br />
      <br />
      <h3>Payment</h3>
      <br />
      <p>
        All payments for Measurely are processed through Stripe. Different
        plans are available for purchase, and payment terms will be displayed
        at checkout. Measurely does not offer refunds.
      </p>
      <br />
      <br />
      <h3>Data Usage</h3>
      <br />
      <p>
        Measurely collects and processes user data solely for the purpose of
        providing analytics. Your data will not be used for any other purposes.
      </p>
      <br />
      <br />
      <h3>Liability</h3>
      <br />
      <p>
        Measurely is provided on an "as is" and "as available" basis. We do not
        guarantee uninterrupted service or the accuracy of analytics. Measurely
        is not liable for any damages arising from the use or inability to use
        the service.
      </p>
      <br />
      <br />
      <h3>Changes to the Terms</h3>
      <br />
      <p>
        Measurely reserves the right to update these Terms at any time. Users
        will be notified of changes by email. Continued use of the service after
        changes are made constitutes acceptance of the revised Terms.
      </p>
      <br />
      <br />
      <h3>Contact Information</h3>
      <br />
      <p>
        For questions or concerns about these Terms of Service, please contact
        us at info@measurely.dev.
      </p>
    </>
  );
}

