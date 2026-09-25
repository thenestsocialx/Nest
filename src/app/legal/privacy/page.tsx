import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.heroZone}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>the fine print</span>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <span className={styles.lastUpdated}>Last updated: September 22, 2026</span>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className={styles.contentZone}>
        <div className={styles.contentInner}>
          <p className={styles.body}>
            The Nest Social is operated by Onvera Solutions Private Limited.
          </p>
          <p className={styles.body}>
            We know that the things you share with us can be personal. This may include how you are
            feeling, what you are going through, information about your relationships, or the kind of
            support you are looking for.
          </p>
          <p className={styles.body}>
            This Privacy Policy explains what information we collect, why we collect it, how we use
            it, when we may share it, and the choices available to you.
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
            The company was incorporated under the Companies Act, 2013 on 25 July 2026.
          </p>
          <p className={styles.body}>
            For the purposes of this Privacy Policy, &ldquo;The Nest Social&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Onvera Solutions Private Limited.
          </p>
          <p className={styles.body}>
            You can contact us at: care@thenestsocial.com
          </p>

          {/* 2 */}
          <h2 className={styles.secHeading}>2. What This Policy Covers</h2>
          <p className={styles.body}>This Privacy Policy applies to information collected through:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>thenestsocial.com</li>
            <li className={styles.listItem}>Ally bookings and sessions</li>
            <li className={styles.listItem}>Nila</li>
            <li className={styles.listItem}>The Kanmani Fund</li>
            <li className={styles.listItem}>Workplace and organisational programmes</li>
            <li className={styles.listItem}>Forms, assessments and check-ins</li>
            <li className={styles.listItem}>Our communications with you</li>
            <li className={styles.listItem}>Other services provided through The Nest Social</li>
          </ul>
          <p className={styles.body}>
            The types of information we collect depend on how you use our services.
          </p>

          {/* 3 */}
          <h2 className={styles.secHeading}>3. Information We Collect</h2>
          <p className={styles.body}>
            <strong>Account information</strong>
            <br />
            If you sign in through Google, we may receive information associated with your Google
            account, such as your name, email address and profile information.
          </p>
          <p className={styles.body}>
            <strong>Information you provide to us</strong>
            <br />
            You may choose to provide information through forms, assessments, check-ins, support
            requests, feedback or other interactions with us. This may include information about your
            wellbeing, relationships, preferences, experiences, or the type of support you are looking
            for.
          </p>
          <p className={styles.body}>
            <strong>Booking information</strong>
            <br />
            When you book an Ally, we may collect your booking details, the Ally you have selected,
            session date and time, booking history, and information required to manage your
            appointment.
          </p>
          <p className={styles.body}>
            <strong>Payment information</strong>
            <br />
            Payments are processed through payment providers such as Razorpay. We do not intend to
            store your complete card or bank account information on our own systems. Payment providers
            may collect and process payment information according to their own privacy policies and
            terms.
          </p>
          <p className={styles.body}>
            <strong>Nila conversations</strong>
            <br />
            If you use Nila, your conversations may be processed by the technology and AI
            infrastructure that powers the service. These conversations may also be processed by our
            safety systems where necessary to identify situations that may require additional support
            or crisis resources.
          </p>
          <p className={styles.body}>
            <strong>Communications</strong>
            <br />
            If you contact us through email, WhatsApp, forms or other communication channels, we may
            retain the information you provide so that we can respond to you, manage your request and
            maintain appropriate records.
          </p>
          <p className={styles.body}>
            <strong>Emergency contact information</strong>
            <br />
            If you provide an emergency contact, we may collect their name, their relationship to you,
            and their phone number or other contact details. We collect this information to support our
            safety processes and to respond to serious safety or crisis situations.
          </p>
          <p className={styles.body}>
            If we reasonably believe that there is a serious and immediate risk of harm to you or
            another person, we may use the emergency contact information you have provided to contact
            that person where we believe doing so may help protect life or prevent serious harm, subject
            to applicable law. Emergency contact information is not used for marketing or unrelated
            communications.
          </p>
          <p className={styles.body}>
            <strong>Technical information</strong>
            <br />
            We may collect standard technical and usage information about your use of our website and
            services, such as device information, browser information, IP address, usage information,
            and information about how you interact with our website. We may also use analytics and
            similar technologies to understand how our website and services are being used and to
            improve them.
          </p>

          {/* 4 */}
          <h2 className={styles.secHeading}>4. Information Relating to Wellbeing</h2>
          <p className={styles.body}>
            Some information you provide to The Nest Social may be sensitive. This can include
            information about your emotional wellbeing, your relationships, your mental health, your
            experiences, your reasons for seeking support, or information you share during an Ally
            session or through Nila.
          </p>
          <p className={styles.body}>
            We use such information only for purposes connected with providing, securing and improving
            our services, including matching and facilitating support where applicable.
          </p>
          <p className={styles.body}>
            Where consent is required by applicable law, we will seek appropriate consent. Where we
            rely on consent, you may withdraw it subject to applicable law. Withdrawal of consent may
            affect our ability to continue providing certain services that depend on that information.
          </p>

          {/* 5 */}
          <h2 className={styles.secHeading}>5. How We Use Your Information</h2>
          <p className={styles.body}>We may use your information to:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Create and manage your account</li>
            <li className={styles.listItem}>Provide access to our services</li>
            <li className={styles.listItem}>Help you discover and book an Ally</li>
            <li className={styles.listItem}>Facilitate Ally sessions and manage appointments</li>
            <li className={styles.listItem}>Provide Nila</li>
            <li className={styles.listItem}>Operate safety and security systems</li>
            <li className={styles.listItem}>
              Identify situations where additional support or crisis resources may be appropriate
            </li>
            <li className={styles.listItem}>
              Communicate with you about your bookings, account and requests
            </li>
            <li className={styles.listItem}>Process payments</li>
            <li className={styles.listItem}>
              Respond to questions, complaints and support requests
            </li>
            <li className={styles.listItem}>
              Use emergency contact information where necessary to respond to a serious safety
              situation
            </li>
            <li className={styles.listItem}>Improve our website and services</li>
            <li className={styles.listItem}>
              Understand how our services are being used
            </li>
            <li className={styles.listItem}>
              Develop aggregate or de-identified insights about service usage
            </li>
            <li className={styles.listItem}>Prevent fraud, misuse and security incidents</li>
            <li className={styles.listItem}>
              Protect the safety and security of our users, practitioners, staff and services
            </li>
            <li className={styles.listItem}>
              Comply with applicable legal and regulatory requirements
            </li>
          </ul>

          {/* 6 */}
          <h2 className={styles.secHeading}>6. Emergency Contacts and Serious Safety Situations</h2>
          <p className={styles.body}>
            The Nest Social is not an emergency or crisis service. If you provide an emergency
            contact, we may use their information as part of our safety processes.
          </p>
          <p className={styles.body}>
            If we reasonably believe there is a serious and immediate risk of harm to you or another
            person, we may take appropriate steps to respond to that situation. Depending on the
            circumstances, this may include contacting an emergency contact you have provided,
            providing or directing you to appropriate crisis resources, sharing relevant information
            where necessary and permitted by applicable law, or contacting appropriate emergency or
            other authorities where we believe this is necessary to protect life or prevent serious
            harm.
          </p>
          <p className={styles.body}>
            We do not guarantee that an emergency contact will be contacted in every crisis situation.
            Safety decisions may depend on the circumstances, the information available to us,
            applicable law and the capabilities of our safety systems.
          </p>
          <p className={styles.body}>
            Emergency contact information is used only for purposes connected with safety, service
            delivery, legal compliance or other purposes described in this Privacy Policy.
          </p>

          {/* 7 */}
          <h2 className={styles.secHeading}>7. Information Shared with Your Ally</h2>
          <p className={styles.body}>
            The Ally you choose may receive information that is reasonably necessary to provide your
            session. Allies are independent licensed professionals and are responsible for the
            professional services they provide. They are expected to maintain appropriate professional
            confidentiality and comply with their professional obligations and agreements with The
            Nest Social.
          </p>

          {/* 8 */}
          <h2 className={styles.secHeading}>8. Service Providers</h2>
          <p className={styles.body}>
            We work with third-party service providers to operate The Nest Social. Depending on the
            service you use, these may include providers for payment processing, appointment
            scheduling, video calls, email, hosting and infrastructure, analytics and website
            operations, AI infrastructure, and security and safety systems.
          </p>
          <p className={styles.body}>
            For example, payments may be processed through Razorpay, while scheduling and online
            sessions may use services such as Zoho Bookings and Google Meet. These providers may
            process information on our behalf or as independent service providers under their own
            applicable terms and privacy policies.
          </p>
          <p className={styles.body}>We do not sell your personal data.</p>

          {/* 9 */}
          <h2 className={styles.secHeading}>9. Nila and AI Processing</h2>
          <p className={styles.body}>
            Nila is an AI companion. Nila is not a therapist, counsellor, doctor or medical device.
            Nila does not diagnose conditions, prescribe medication or provide medical treatment.
          </p>
          <p className={styles.body}>
            Nila conversations may be processed using third-party AI infrastructure to generate
            responses and operate the service. Automated safety systems may also process conversations
            to identify situations where additional support or crisis resources may be appropriate.
          </p>
          <p className={styles.body}>
            Where a serious and reasonable safety concern is identified, we may take appropriate steps
            to protect the user or others, subject to applicable law. Because Nila uses automated
            systems, its responses may not always be accurate, appropriate or complete. You should not
            rely on Nila for emergency, medical or crisis advice.
          </p>

          {/* 10 */}
          <h2 className={styles.secHeading}>10. When We May Disclose Information</h2>
          <p className={styles.body}>
            We may disclose information when reasonably necessary to provide the service you
            requested, work with your chosen Ally, process payments, operate our technology and
            safety infrastructure, respond to serious safety or crisis situations, contact an
            emergency contact you have provided where we reasonably believe this may be necessary to
            protect life or prevent serious harm, comply with applicable law, or protect the rights,
            safety or property of The Nest Social, our users, practitioners or others.
          </p>
          <p className={styles.body}>
            We do not sell your personal data. We do not use your sensitive wellbeing information to
            serve you targeted advertising.
          </p>

          {/* 11 */}
          <h2 className={styles.secHeading}>11. How Long We Keep Your Information</h2>
          <p className={styles.body}>
            We keep personal data for as long as your account is active and as long as reasonably
            necessary for the purposes described in this Privacy Policy. We may retain information for
            longer where necessary to comply with legal or regulatory requirements, resolve disputes,
            maintain appropriate business and transaction records, prevent fraud or misuse, protect the
            security of our services, or respond to safety incidents.
          </p>
          <p className={styles.body}>
            When information is no longer required, we will delete it or anonymise it, subject to
            applicable law and our legitimate operational requirements. You may request deletion of
            your personal data by contacting us at care@thenestsocial.com.
          </p>

          {/* 12 */}
          <h2 className={styles.secHeading}>12. Your Rights and Choices</h2>
          <p className={styles.body}>
            Subject to applicable law, including India&rsquo;s Digital Personal Data Protection Act,
            2023, you may have rights relating to your personal data, including the right to:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Access information about your personal data</li>
            <li className={styles.listItem}>
              Request correction of inaccurate or incomplete information
            </li>
            <li className={styles.listItem}>Request deletion of personal data</li>
            <li className={styles.listItem}>
              Withdraw consent where processing is based on consent
            </li>
            <li className={styles.listItem}>
              Nominate another person to exercise applicable rights on your behalf in the event of
              death or incapacity
            </li>
            <li className={styles.listItem}>
              Raise a grievance regarding the processing of your personal data
            </li>
          </ul>
          <p className={styles.body}>
            To exercise an applicable right or raise a grievance, email us at:
            care@thenestsocial.com
          </p>
          <p className={styles.body}>
            We may need to verify your identity before acting on certain requests. Where you withdraw
            consent, we may no longer be able to provide services that depend on that consent or
            information.
          </p>

          {/* 13 */}
          <h2 className={styles.secHeading}>13. Children</h2>
          <p className={styles.body}>
            Our services are intended for people aged 18 and over. We do not knowingly provide our
            services to or knowingly collect personal data from anyone under 18.
          </p>
          <p className={styles.body}>
            If you believe that someone under 18 has provided us with personal data, please contact
            us at care@thenestsocial.com.
          </p>

          {/* 14 */}
          <h2 className={styles.secHeading}>14. Security</h2>
          <p className={styles.body}>
            We use reasonable technical and organisational measures to protect the information we
            process. These measures may include access controls, security practices and encryption in
            transit.
          </p>
          <p className={styles.body}>
            However, no online service or method of transmitting or storing information can be
            guaranteed to be completely secure. If we become aware of a security incident affecting
            personal data, we will take appropriate steps in accordance with applicable law.
          </p>

          {/* 15 */}
          <h2 className={styles.secHeading}>15. Not an Emergency Service</h2>
          <p className={styles.body}>
            The Nest Social is not an emergency or crisis service. Our services, including Nila, are
            not designed to replace emergency services, medical care or crisis intervention.
          </p>
          <p className={styles.body}>
            If you or someone else is in immediate danger or at risk of serious harm, contact your
            local emergency services or seek immediate help from a qualified professional.
          </p>
          <p className={styles.body}>
            In India, you may also contact: iCall: 9152987821 &nbsp;&middot;&nbsp; Vandrevala
            Foundation: 1860-2662-345
          </p>
          <p className={styles.body}>
            You can also find crisis support resources through findahelpline.com.
          </p>

          {/* 16 */}
          <h2 className={styles.secHeading}>16. Grievance and Contact</h2>
          <p className={styles.body}>
            If you have a question, concern or grievance relating to this Privacy Policy or our
            handling of your personal data, please contact us at:
          </p>
          <address className={styles.address}>
            <strong>Grievance Officer:</strong> Dhineshkumar K
            <br />
            <strong>Designation:</strong> Head of Operations
            <br />
            <strong>Email:</strong> dhinesh@thenestsocial.com
            <br />
            <br />
            <strong>The Nest Social</strong>
            <br />
            Operated by Onvera Solutions Private Limited
            <br />
            No. 1429/11, Lakshmanapatty,
            <br />
            Uppidamangalam, Karur,
            <br />
            Tamil Nadu 639114, India
          </address>
          <p className={styles.body}>
            We will review and respond to grievances in accordance with applicable law.
          </p>

          {/* 17 */}
          <h2 className={styles.secHeading}>17. Changes to This Policy</h2>
          <p className={styles.body}>
            We may update this Privacy Policy from time to time to reflect changes to our services,
            technology, legal requirements or privacy practices. When we make changes, we will post
            the updated version on this page and update the &ldquo;Last updated&rdquo; date.
          </p>
          <p className={styles.body}>
            Where appropriate, we may also notify you of material changes through the contact
            information associated with your account.
          </p>
        </div>
      </section>
    </>
  )
}
