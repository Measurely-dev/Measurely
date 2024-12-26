import { Separator } from '@/components/ui/separator';

export default function PrivacyContent() {
  return (
    <>
      <h2>Privacy Policy for Measurely</h2>
      <Separator className='my-5' />
      <br />
      <p>
        If you have any questions about our privacy policy, please feel free to
        contact us by email at
        <a href='mailto:info@measurely.dev'>info@measurely.dev</a>.
      </p>
      <br />
      <p>
        At Measurely, we are committed to protecting your privacy. This privacy
        policy outlines how we collect, use, and protect your information when
        you use our platform.
      </p>
      <br />
      <br />
      <h3>Information We Collect</h3>
      <br />
      <p>
        Measurely collects information provided directly by you when you sign up
        for an account, use the platform, or interact with our support team. The
        types of information we collect include:
      </p>
      <ul className='list-inside list-disc'>
        <li>Personal identification information (name, email address, etc.)</li>
        <li>
          Authentication data through external providers (such as Google and
          GitHub) for login purposes
        </li>
        <li>
          Subscription and payment details (such as billing address and payment
          method, which are processed by third-party payment providers)
        </li>
      </ul>
      <br />
      <h3>Cookies for Authentication</h3>
      <br />
      <p>
        Measurely uses cookies strictly for authentication purposes. When you
        log in using external providers such as Google or GitHub, we use cookies
        to maintain your session and ensure secure access to the platform. These
        cookies are necessary for the functioning of the platform and are not
        used for tracking or advertising purposes.
      </p>
      <br />
      <h3>External Authentication Providers</h3>
      <br />
      <p>
        We use external providers, such as Google and GitHub, for user
        authentication. When you sign up or log in to Measurely using one of
        these services, the provider will share certain personal information
        (such as your name and email address) with us to verify your identity
        and create your user account. This information is stored securely and
        used only for authentication and account management purposes.
      </p>
      <br />
      <h3>Payment Information</h3>
      <br />
      <p>
        Payment for Measurely subscriptions is processed on a monthly basis. We
        use third-party payment processors to handle your payment information,
        such as credit card details or other payment methods. Measurely does not
        store or process your payment details directly. These third-party
        providers use encryption and other security measures to protect your
        payment information.
      </p>
      <br />
      <h3>Data Usage</h3>
      <br />
      <p>
        All data collected within Measurely is used exclusively within the
        platform to provide the core functionality of the service, including but
        not limited to:
      </p>
      <ul className='list-inside list-disc'>
        <li>Managing user accounts and subscriptions</li>
        <li>Providing custom metrics and related services</li>
        <li>Delivering customer support</li>
      </ul>
      <p>
        Measurely does not share, sell, or rent your personal information to
        third parties for marketing purposes. We will never share your data
        outside of the platform unless required by law or for essential services
        like payment processing, where third-party providers are involved in the
        transaction.
      </p>
      <br />
      <h3>Changes to Subscriptions</h3>
      <br />
      <p>
        As Measurely evolves, subscription plans may change. This could include
        updates to feature limits, pricing adjustments, or the introduction of
        new subscription types. Any changes to the subscription plans will be
        communicated to users in advance, and you will have the option to adjust
        your plan accordingly.
      </p>
      <br />
      <h3>Data Security</h3>
      <br />
      <p>
        We take data security seriously and use industry-standard encryption and
        security practices to protect your information. However, no method of
        transmission over the Internet or electronic storage is 100% secure, and
        we cannot guarantee absolute security. We encourage users to take their
        own precautions to protect their personal data.
      </p>
      <br />
      <h3>Online Privacy Policy Only</h3>
      <br />
      <p>
        This privacy policy applies solely to activities on our website and
        within the Measurely platform. It does not cover information collected
        offline or through other channels.
      </p>
      <br />
      <h3>Consent</h3>
      <br />
      <p>
        By using Measurely, you consent to the terms outlined in this privacy
        policy. If you do not agree with any part of this policy, please refrain
        from using our platform.
      </p>
      <br />
      <h3>Policy Updates</h3>
      <br />
      <p>
        This Privacy Policy was last updated on: December 25th, 2024. Should we
        update, amend, or make any changes to this policy, those changes will be
        posted here, and the "last updated" date will be revised accordingly. It
        is your responsibility to review this policy regularly for any changes.
      </p>
    </>
  );
}
