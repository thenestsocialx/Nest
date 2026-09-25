import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
}

export default function TermsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.heroZone}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>the fine print</span>
          <h1 className={styles.pageTitle}>Terms &amp; Conditions</h1>
          <span className={styles.lastUpdated}>Last updated: September 22, 2026</span>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className={styles.contentZone}>
        <div className={styles.contentInner}>
          <p className={styles.body}>Welcome to The Nest Social.</p>
          <p className={styles.body}>
            These Terms &amp; Conditions govern your use of The Nest Social website, services,
            products and platforms.
          </p>
          <p className={styles.body}>
            The Nest Social is operated by Onvera Solutions Private Limited.
          </p>
          <p className={styles.body}>
            By accessing our website, creating an account, booking a session, using Nila, or using
            any other service provided by The Nest Social, you agree to these Terms &amp; Conditions.
            Please read them carefully.
          </p>

          {/* 1 */}
          <h2 className={styles.secHeading}>1. Who We Are</h2>
          <p className={styles.body}>The Nest Social is operated by:</p>
          <p className={styles.body}>
            <strong>Onvera Solutions Private Limited</strong>
            <br />
            CIN: U62011TN2026PTC195846
            <br />
            <br />
            Registered office:
            <br />
            No. 1429/11, Lakshmanapatty,
            <br />
            Uppidamangalam, Karur,
            <br />
            Tamil Nadu 639114, India
          </p>
          <p className={styles.body}>
            In these Terms, &ldquo;The Nest Social&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
            &ldquo;our&rdquo; refer to Onvera Solutions Private Limited.
          </p>
          <p className={styles.body}>
            &ldquo;You&rdquo;, &ldquo;your&rdquo; or &ldquo;user&rdquo; refers to anyone who
            accesses or uses our services.
          </p>

          {/* 2 */}
          <h2 className={styles.secHeading}>2. Our Services</h2>
          <p className={styles.body}>
            The Nest Social provides technology-enabled wellbeing and support services, which may
            include:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Connecting users with independent licensed professionals known as Allies
            </li>
            <li className={styles.listItem}>Facilitating online sessions with Allies</li>
            <li className={styles.listItem}>Providing Nila, our AI companion</li>
            <li className={styles.listItem}>Providing access to the Kanmani Fund</li>
            <li className={styles.listItem}>Workplace and organisational programmes</li>
            <li className={styles.listItem}>
              Educational content, resources and other wellbeing-related services
            </li>
          </ul>
          <p className={styles.body}>
            The services available to you may change over time. We may add, modify, suspend or
            discontinue features or services where reasonably necessary.
          </p>

          {/* 3 */}
          <h2 className={styles.secHeading}>3. Eligibility</h2>
          <p className={styles.body}>
            Our services are intended for people aged 18 years and above.
          </p>
          <p className={styles.body}>By using The Nest Social, you confirm that:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>You are at least 18 years old</li>
            <li className={styles.listItem}>The information you provide is accurate and current</li>
            <li className={styles.listItem}>
              You have the legal capacity to agree to these Terms
            </li>
            <li className={styles.listItem}>
              You will use our services only for lawful purposes
            </li>
          </ul>
          <p className={styles.body}>
            If you are under 18, please do not create an account or use our services.
          </p>

          {/* 4 */}
          <h2 className={styles.secHeading}>4. Creating and Using Your Account</h2>
          <p className={styles.body}>
            Some services may require you to create an account. You are responsible for:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Providing accurate information</li>
            <li className={styles.listItem}>Keeping your account information up to date</li>
            <li className={styles.listItem}>Keeping your login credentials secure</li>
            <li className={styles.listItem}>
              All activity carried out through your account
            </li>
          </ul>
          <p className={styles.body}>
            Please contact us if you believe your account has been accessed without your permission.
          </p>
          <p className={styles.body}>
            We may suspend or restrict an account where we reasonably believe it has been used
            fraudulently, unlawfully, abusively or in violation of these Terms.
          </p>

          {/* 5 */}
          <h2 className={styles.secHeading}>5. Ally Sessions</h2>

          <h3 className={styles.subHeading}>5.1 Independent Professionals</h3>
          <p className={styles.body}>
            Allies are independent licensed professionals who provide services through The Nest
            Social. The Nest Social facilitates discovery, booking, communication and technology for
            these sessions. Unless expressly stated otherwise, the professional relationship for the
            session is between you and the Ally. Each Ally is responsible for the professional
            services they provide and for complying with their applicable professional obligations.
          </p>

          <h3 className={styles.subHeading}>5.2 The Counselling Relationship</h3>
          <p className={styles.body}>
            Ally sessions are intended to provide a professional and supportive space where you can
            discuss concerns, experiences, relationships, emotions and other matters relevant to the
            support you are seeking.
          </p>
          <p className={styles.body}>
            The effectiveness of a session can depend on a number of factors, including your
            participation, the nature of your concerns and the professional judgement of the Ally.
            You may experience difficult or uncomfortable emotions during a session. Your Ally will
            work with you within the scope of the service they provide.
          </p>

          <h3 className={styles.subHeading}>5.3 Confidentiality</h3>
          <p className={styles.body}>
            Information shared during an Ally session is generally treated as confidential by the
            Ally, subject to the Ally&rsquo;s professional obligations, applicable law and the limits
            described in these Terms.
          </p>
          <p className={styles.body}>
            The Nest Social may also process information relating to your booking, communications and
            use of our services in accordance with our Privacy Policy.
          </p>
          <p className={styles.body}>
            Your Ally may be required or permitted to disclose information in certain circumstances,
            including where there is a serious and immediate concern about the safety of you or
            another person, or where disclosure is required or permitted by applicable law. Where
            reasonably possible and appropriate, the Ally may discuss such limits to confidentiality
            with you.
          </p>

          <h3 className={styles.subHeading}>5.4 Limits to Confidentiality</h3>
          <p className={styles.body}>
            Confidentiality is not absolute. Information may need to be disclosed where an Ally
            reasonably believes that doing so is necessary to respond to a serious and immediate risk
            of harm to you or another person, or where disclosure is otherwise required or permitted
            by applicable law.
          </p>
          <p className={styles.body}>
            Where you have provided an emergency contact, the Ally or The Nest Social may use that
            information in accordance with our Privacy Policy and applicable law when there is a
            serious and immediate safety concern.
          </p>

          <h3 className={styles.subHeading}>5.5 Booking a Session</h3>
          <p className={styles.body}>
            When you book an Ally, you are responsible for providing accurate booking information and
            being available at the scheduled time. Your booking is subject to availability and
            successful payment where payment is required.
          </p>
          <p className={styles.body}>
            We may provide appointment reminders and other booking-related communications through
            email, WhatsApp or other channels.
          </p>

          <h3 className={styles.subHeading}>5.6 Session Format and Duration</h3>
          <p className={styles.body}>
            Unless otherwise stated at the time of booking, an Ally session is generally 55 minutes.
            The frequency, format and duration of sessions may differ depending on the service and
            the arrangement between you and your Ally.
          </p>

          <h3 className={styles.subHeading}>5.7 Ending the Professional Relationship</h3>
          <p className={styles.body}>You may stop using Ally services at any time.</p>
          <p className={styles.body}>
            An Ally may also end or pause the professional relationship where they reasonably believe
            that continuing the service is not appropriate or possible, including where there are
            repeated missed sessions, inappropriate or abusive behaviour, threats, violence, or other
            circumstances that affect the safety or professional boundaries of the Ally. Where
            appropriate and reasonably possible, the Ally may suggest another suitable source of
            support or referral.
          </p>

          <h3 className={styles.subHeading}>5.8 Missed Sessions</h3>
          <p className={styles.body}>
            If you do not attend your scheduled session and have not cancelled or rescheduled it in
            accordance with our Cancellation &amp; Refund Policy, the session may be treated as a
            missed appointment. Any refund or rescheduling in such circumstances will be subject to
            the applicable Cancellation &amp; Refund Policy.
          </p>

          {/* 6 */}
          <h2 className={styles.secHeading}>6. Cancellations, Rescheduling and Refunds</h2>
          <p className={styles.body}>
            Cancellations, rescheduling and refunds for Ally sessions are governed by our
            Cancellation &amp; Refund Policy.
          </p>
          <p className={styles.body}>
            By booking an Ally session, you acknowledge that you have read and agreed to the
            applicable cancellation and refund terms.
          </p>
          <p className={styles.body}>
            For questions about a cancellation, rescheduling request or refund, you can contact us
            at care@thenestsocial.com.
          </p>

          {/* 7 */}
          <h2 className={styles.secHeading}>7. Payments</h2>
          <p className={styles.body}>
            Where a service requires payment, the applicable price will be displayed before you
            complete your purchase or booking.
          </p>
          <p className={styles.body}>
            Payments may be processed through third-party payment providers such as Razorpay. By
            making a payment, you confirm that:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>The payment information you provide is accurate</li>
            <li className={styles.listItem}>
              You are authorised to use the payment method
            </li>
            <li className={styles.listItem}>
              You agree to pay the amount displayed at checkout
            </li>
          </ul>
          <p className={styles.body}>
            Prices may change from time to time. Changes will not affect a payment that has already
            been successfully completed, unless otherwise required by law.
          </p>

          {/* 8 */}
          <h2 className={styles.secHeading}>8. Nila</h2>
          <p className={styles.body}>
            Nila is an AI companion provided by The Nest Social. Nila is designed to provide
            conversational support and a place to talk.
          </p>
          <p className={styles.body}>Nila is not:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>A therapist</li>
            <li className={styles.listItem}>A counsellor</li>
            <li className={styles.listItem}>A doctor</li>
            <li className={styles.listItem}>A medical professional</li>
            <li className={styles.listItem}>A crisis service</li>
            <li className={styles.listItem}>A medical device</li>
          </ul>
          <p className={styles.body}>
            Nila does not diagnose medical or mental health conditions, prescribe medication or
            provide medical treatment.
          </p>
          <p className={styles.body}>
            Nila uses artificial intelligence and may sometimes provide responses that are inaccurate,
            incomplete, inappropriate or unsuitable for your circumstances. You should use your own
            judgement when relying on information provided by Nila.
          </p>
          <p className={styles.body}>
            Nila should not be used as a substitute for professional medical care, therapy, emergency
            services or crisis intervention.
          </p>

          {/* 9 */}
          <h2 className={styles.secHeading}>9. Nila Subscriptions</h2>
          <p className={styles.body}>
            If Nila is offered as a paid subscription, the applicable subscription price and billing
            frequency will be displayed before you subscribe.
          </p>
          <p className={styles.body}>Unless otherwise stated:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Subscriptions renew automatically at the applicable billing interval
            </li>
            <li className={styles.listItem}>
              Cancelling your subscription stops future renewals
            </li>
            <li className={styles.listItem}>
              You will generally retain access until the end of your current paid period
            </li>
            <li className={styles.listItem}>
              Cancelling a subscription does not automatically result in a refund for the current
              paid period
            </li>
          </ul>
          <p className={styles.body}>
            Where required by applicable law, different refund or cancellation rights may apply. We
            may change subscription prices with reasonable notice. Any price change will apply to
            future billing periods and not to a period that has already been paid for, unless
            otherwise stated.
          </p>

          {/* 10 */}
          <h2 className={styles.secHeading}>10. Kanmani Fund</h2>
          <p className={styles.body}>
            The Kanmani Fund provides eligible users with access to support sessions without
            requiring them to pay the normal session fee.
          </p>
          <p className={styles.body}>
            Eligibility and availability may depend on the criteria and funding available at the
            time. The Kanmani Fund does not provide a cash alternative or cash refund to users.
            Access to the Kanmani Fund is subject to availability and the applicable programme terms.
          </p>
          <p className={styles.body}>
            We may review, modify, pause or discontinue the programme where reasonably necessary.
          </p>

          {/* 11 */}
          <h2 className={styles.secHeading}>11. Workplace and Organisational Programmes</h2>
          <p className={styles.body}>
            The Nest Social may provide services to organisations, employers or other institutions.
          </p>
          <p className={styles.body}>
            Workplace programmes may be governed by a separate agreement, statement of work,
            proposal or other written arrangement between The Nest Social and the organisation. Where
            there is a conflict between these Terms and a specific written agreement for a workplace
            programme, the specific agreement will apply to the extent of that conflict.
          </p>

          {/* 12 */}
          <h2 className={styles.secHeading}>12. Emergency Situations</h2>
          <p className={styles.body}>
            The Nest Social is not an emergency service. Our services, including Nila and Ally
            sessions, are not designed to provide emergency response or immediate crisis
            intervention.
          </p>
          <p className={styles.body}>
            If you or someone else is in immediate danger or at risk of serious harm, please contact
            your local emergency services or seek immediate help from a qualified professional.
          </p>
          <p className={styles.body}>
            <strong>Emergency and crisis support</strong>
          </p>
          <p className={styles.body}>If you are in India, you can also contact:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Emergency services: 112</li>
            <li className={styles.listItem}>Tele-MANAS: 14416 or 1800-89-14416</li>
            <li className={styles.listItem}>iCALL: 9152987821</li>
            <li className={styles.listItem}>Vandrevala Foundation: 1860-2662-345</li>
          </ul>
          <p className={styles.body}>
            If you are outside India, you can contact your local emergency services or find a local
            crisis support service through findahelpline.com.
          </p>

          {/* 13 */}
          <h2 className={styles.secHeading}>13. Your Responsibilities</h2>
          <p className={styles.body}>
            When using The Nest Social, you agree that you will not:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Use our services for an unlawful purpose</li>
            <li className={styles.listItem}>Provide false or misleading information</li>
            <li className={styles.listItem}>Impersonate another person</li>
            <li className={styles.listItem}>Attempt to access another person&rsquo;s account</li>
            <li className={styles.listItem}>
              Interfere with or disrupt our website or services
            </li>
            <li className={styles.listItem}>
              Attempt to gain unauthorised access to our systems
            </li>
            <li className={styles.listItem}>Introduce malicious software or code</li>
            <li className={styles.listItem}>Misuse our services or technology</li>
            <li className={styles.listItem}>
              Harass, threaten or abuse our team, Allies or other users
            </li>
            <li className={styles.listItem}>
              Use our services to infringe another person&rsquo;s rights
            </li>
            <li className={styles.listItem}>
              Copy, reproduce, distribute or commercially exploit our content without permission
            </li>
          </ul>
          <p className={styles.body}>
            We may restrict or terminate access where we reasonably believe these Terms have been
            violated.
          </p>

          {/* 14 */}
          <h2 className={styles.secHeading}>14. Content You Provide</h2>
          <p className={styles.body}>
            You may provide information, messages, feedback, reviews or other content while using
            our services. You retain your rights in content that belongs to you.
          </p>
          <p className={styles.body}>
            By submitting content to us, you grant The Nest Social the permissions reasonably
            necessary to receive, store, process and display that content for the purpose for which
            you provided it and to operate the relevant service.
          </p>
          <p className={styles.body}>
            We will handle personal information in accordance with our Privacy Policy. You should not
            submit content that you do not have the right to share.
          </p>

          {/* 15 */}
          <h2 className={styles.secHeading}>15. Intellectual Property</h2>
          <p className={styles.body}>
            The Nest Social and its licensors own or control the intellectual property associated
            with our website and services, including where applicable:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Our name and branding</li>
            <li className={styles.listItem}>Logos</li>
            <li className={styles.listItem}>Website design</li>
            <li className={styles.listItem}>Text, graphics and illustrations</li>
            <li className={styles.listItem}>Software and product interfaces</li>
            <li className={styles.listItem}>
              Original content and other materials created or provided by us
            </li>
          </ul>
          <p className={styles.body}>
            You may use our services for their intended personal or organisational purpose. You may
            not copy, modify, reproduce, distribute, sell, license or commercially exploit our
            intellectual property without our prior written permission. Nothing in these Terms
            transfers ownership of our intellectual property to you.
          </p>

          {/* 16 */}
          <h2 className={styles.secHeading}>16. Third-Party Services</h2>
          <p className={styles.body}>
            Our services may contain or rely on third-party services, platforms or links. These may
            include payment providers, scheduling services, video conferencing platforms,
            communication tools, hosting providers and AI infrastructure.
          </p>
          <p className={styles.body}>
            Third-party services are governed by their own terms and privacy policies. We are not
            responsible for the availability, security, content or operation of third-party services
            that are outside our reasonable control.
          </p>

          {/* 17 */}
          <h2 className={styles.secHeading}>17. Service Availability</h2>
          <p className={styles.body}>
            We aim to keep The Nest Social available and functioning reliably, but we do not
            guarantee that our website or services will always be available, uninterrupted,
            error-free, secure, or compatible with every device or browser.
          </p>
          <p className={styles.body}>
            Services may occasionally be unavailable because of maintenance, technical issues,
            updates, third-party failures or circumstances beyond our reasonable control.
          </p>

          {/* 18 */}
          <h2 className={styles.secHeading}>18. Professional Services Disclaimer</h2>
          <p className={styles.body}>
            The Nest Social provides a platform and technology that helps people access support.
            Information available through our website, Nila, educational content or other resources
            is not a substitute for professional medical advice, diagnosis or treatment unless a
            service is specifically provided by a qualified professional acting within their
            professional scope.
          </p>
          <p className={styles.body}>
            Where you receive professional services from an Ally, the Ally is responsible for the
            professional service they provide. If you have a medical emergency or immediate safety
            concern, seek emergency assistance rather than relying on The Nest Social.
          </p>

          {/* 19 */}
          <h2 className={styles.secHeading}>19. Limitation of Liability</h2>
          <p className={styles.body}>
            To the maximum extent permitted by applicable law, The Nest Social and Onvera Solutions
            Private Limited will not be responsible for indirect, incidental, special or
            consequential losses arising from your use of our services.
          </p>
          <p className={styles.body}>
            This may include loss resulting from interruption of services, loss of data, reliance on
            information provided through our services, third-party service failures, or unauthorised
            access caused by circumstances outside our reasonable control.
          </p>
          <p className={styles.body}>
            Nothing in these Terms excludes or limits liability where such exclusion or limitation is
            not permitted by applicable law, or limits your statutory rights where those rights
            cannot legally be excluded.
          </p>

          {/* 20 */}
          <h2 className={styles.secHeading}>20. Indemnity</h2>
          <p className={styles.body}>
            To the extent permitted by applicable law, you agree to indemnify and hold harmless The
            Nest Social, Onvera Solutions Private Limited, its employees, contractors and
            representatives from claims, losses, liabilities or expenses arising from your misuse of
            our services, your violation of these Terms, your violation of applicable law, or your
            infringement of another person&rsquo;s rights.
          </p>
          <p className={styles.body}>
            This section will apply only to the extent permitted by applicable law.
          </p>

          {/* 21 */}
          <h2 className={styles.secHeading}>21. Suspension and Termination</h2>
          <p className={styles.body}>You may stop using our services at any time.</p>
          <p className={styles.body}>
            We may suspend or terminate your access to all or part of our services if you violate
            these Terms, we reasonably believe your use creates a security or safety risk, we are
            required to do so by law, continued provision of the service is no longer reasonably
            possible, or there is fraudulent or abusive use of the service.
          </p>
          <p className={styles.body}>
            Where appropriate, we may provide notice before suspension or termination. Termination
            will not affect rights or obligations that arose before termination.
          </p>

          {/* 22 */}
          <h2 className={styles.secHeading}>22. Changes to Our Services</h2>
          <p className={styles.body}>
            We may update, modify or discontinue features, products or services from time to time.
            Where a material change affects an existing paid service, we will make reasonable efforts
            to communicate the change where appropriate. We are not required to continue offering a
            particular feature indefinitely.
          </p>

          {/* 23 */}
          <h2 className={styles.secHeading}>23. Changes to These Terms</h2>
          <p className={styles.body}>
            We may update these Terms &amp; Conditions from time to time. When we make changes, we
            will update the &ldquo;Last updated&rdquo; date at the top of this page.
          </p>
          <p className={styles.body}>
            If we make material changes, we may provide additional notice where appropriate. Your
            continued use of The Nest Social after the updated Terms take effect means that you
            accept the revised Terms.
          </p>

          {/* 24 */}
          <h2 className={styles.secHeading}>24. Privacy</h2>
          <p className={styles.body}>
            Our collection and use of personal information is governed by our Privacy Policy. The
            Privacy Policy explains what information we collect, why we collect it, how we use it,
            when we may share it, how we handle emergency contact information, and your privacy
            rights and choices. You can read the Privacy Policy on our website.
          </p>

          {/* 25 */}
          <h2 className={styles.secHeading}>25. Governing Law</h2>
          <p className={styles.body}>
            These Terms are governed by the laws of India. Any dispute arising from or relating to
            these Terms or your use of The Nest Social will be subject to the jurisdiction of courts
            of competent jurisdiction in India, subject to applicable law.
          </p>

          {/* 26 */}
          <h2 className={styles.secHeading}>26. General Terms</h2>
          <p className={styles.body}>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining
            provisions will continue to apply.
          </p>
          <p className={styles.body}>
            Our failure to enforce a provision of these Terms does not mean that we waive our right
            to enforce it later.
          </p>
          <p className={styles.body}>
            These Terms, together with our Privacy Policy and any specific terms applicable to a
            particular service, constitute the agreement between you and The Nest Social regarding
            your use of our services.
          </p>

          {/* 27 */}
          <h2 className={styles.secHeading}>27. Contact Us</h2>
          <address className={styles.address}>
            <strong>The Nest Social</strong>
            <br />
            Operated by Onvera Solutions Private Limited
            <br />
            <br />
            <strong>Grievance Officer:</strong> Dhineshkumar K
            <br />
            <strong>Designation:</strong> Head of Operations
            <br />
            <strong>Email:</strong> dhinesh@thenestsocial.com
            <br />
            <br />
            General support: care@thenestsocial.com
            <br />
            <br />
            Registered office:
            <br />
            No. 1429/11, Lakshmanapatty,
            <br />
            Uppidamangalam, Karur,
            <br />
            Tamil Nadu 639114, India
          </address>
        </div>
      </section>
    </>
  )
}
