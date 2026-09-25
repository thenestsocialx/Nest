import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
}

export default function CancellationRefundPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.heroZone}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>the fine print</span>
          <h1 className={styles.pageTitle}>Cancellation &amp; Refund Policy</h1>
          <span className={styles.lastUpdated}>Last updated: September 22, 2026</span>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className={styles.contentZone}>
        <div className={styles.contentInner}>
          <p className={styles.body}>
            At The Nest Social, we understand that plans can change. At the same time, every session
            is a time that an Ally has specifically reserved for you. Our cancellation and
            rescheduling policy is designed to respect both the client&rsquo;s circumstances and the
            Ally&rsquo;s time.
          </p>
          <p className={styles.body}>
            The Nest Social is operated by Onvera Solutions Private Limited.
          </p>

          {/* 1 */}
          <h2 className={styles.secHeading}>1. Cancelling or Rescheduling an Ally Session</h2>
          <p className={styles.body}>
            You can cancel or reschedule your session using the cancellation or rescheduling option
            provided in your booking confirmation or reminder email. You can also reply to your
            booking email or contact us at care@thenestsocial.com if you need assistance.
          </p>
          <p className={styles.body}>
            <strong>Our standard 24-hour policy</strong>
            <br />
            Cancellations and rescheduling must be made at least 24 hours before the scheduled
            session.
          </p>
          <p className={styles.body}>
            For example, if your session is scheduled for 6:00 PM tomorrow, you must cancel or
            reschedule it by 6:00 PM today.
          </p>
          <p className={styles.body}>
            This is our standard cancellation and rescheduling policy. It allows the Ally to manage
            their time and gives us an opportunity to make the session slot available to someone else.
          </p>

          {/* 2 */}
          <h2 className={styles.secHeading}>2. If It Is Your First Session</h2>
          <p className={styles.body}>
            We understand that sometimes you may want to cancel your first session even when there
            are less than 24 hours remaining.
          </p>
          <p className={styles.body}>
            If you want to cancel or reschedule your first session within the 24-hour period, you can
            contact us through your booking email or at care@thenestsocial.com.
          </p>
          <p className={styles.body}>
            In this situation, cancellation or rescheduling is not guaranteed. We will first check
            with the Ally because the Ally has already reserved that time specifically for you. If
            the Ally is not comfortable with the cancellation or rescheduling, the session will
            remain as booked.
          </p>
          <p className={styles.body}>If the Ally approves the request, we may:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Reschedule the session to another available time, or</li>
            <li className={styles.listItem}>Cancel the session.</li>
          </ul>
          <p className={styles.body}>
            If the Ally approves the cancellation, we will process a 50% refund of the amount paid
            for the session. The remaining 50% is retained because the Ally had already reserved
            their time for the session.
          </p>

          {/* 3 */}
          <h2 className={styles.secHeading}>3. Why the First-Session Exception Works This Way</h2>
          <p className={styles.body}>
            When you book a session, an Ally reserves that specific time for you. A cancellation
            close to the session leaves very little opportunity for the Ally to offer that time to
            someone else.
          </p>
          <p className={styles.body}>
            For this reason, we cannot promise a full refund for a last-minute first-session
            cancellation, even when there is a genuine reason for the cancellation. Where the Ally
            agrees to the cancellation, we offer a 50% refund as a way of balancing the
            client&rsquo;s circumstances with the Ally&rsquo;s reserved time.
          </p>

          {/* 4 */}
          <h2 className={styles.secHeading}>4. Emergency Cancellations</h2>
          <p className={styles.body}>
            We understand that genuine emergencies can happen. If an emergency prevents you from
            attending your session, please use the cancellation or rescheduling option in your
            booking email, reply to your booking email, or contact us at care@thenestsocial.com as
            soon as possible.
          </p>
          <p className={styles.body}>
            We will check with the Ally and consider the circumstances. If the Ally is comfortable
            with the situation and another suitable slot is available, we may offer you a free
            rescheduling. An emergency cancellation does not automatically qualify for a refund.
          </p>

          {/* 5 */}
          <h2 className={styles.secHeading}>5. Missed Sessions</h2>
          <p className={styles.body}>
            If you do not attend your scheduled session without cancelling or rescheduling in
            advance, the session may be treated as a missed session. A refund or rescheduling is not
            guaranteed for a missed session.
          </p>
          <p className={styles.body}>
            If you were unable to attend because of an emergency or exceptional circumstance, please
            contact us and we will review the situation with the relevant Ally.
          </p>

          {/* 6 */}
          <h2 className={styles.secHeading}>6. If an Ally Cancels</h2>
          <p className={styles.body}>
            If your Ally needs to cancel your session, we will work with you to find another suitable
            time. You may be offered:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>A free rescheduling, or</li>
            <li className={styles.listItem}>A full refund if the session cannot be rescheduled.</li>
          </ul>

          {/* 7 */}
          <h2 className={styles.secHeading}>
            7. If The Nest Social Is Unable to Provide the Session
          </h2>
          <p className={styles.body}>
            If your session cannot take place because of an issue on our side, we will offer you
            either:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>A free rescheduling, or</li>
            <li className={styles.listItem}>A full refund.</li>
          </ul>

          {/* 8 */}
          <h2 className={styles.secHeading}>8. Nila Subscriptions</h2>
          <p className={styles.body}>If you have a paid Nila subscription:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Cancelling your subscription will stop future renewals</li>
            <li className={styles.listItem}>
              You will generally continue to have access until the end of your current paid period
            </li>
            <li className={styles.listItem}>
              Cancelling your subscription does not automatically result in a refund for the current
              paid period
            </li>
          </ul>
          <p className={styles.body}>
            Where required by applicable law, different cancellation or refund rights may apply.
          </p>

          {/* 9 */}
          <h2 className={styles.secHeading}>9. Kanmani Fund</h2>
          <p className={styles.body}>
            Sessions provided through the Kanmani Fund are offered without a session fee. As there
            is no session fee paid by the user, there is no cash refund associated with a Kanmani
            Fund session.
          </p>
          <p className={styles.body}>
            If you need to cancel or reschedule a Kanmani session, please use the option provided in
            your booking email or contact us at care@thenestsocial.com as early as possible.
          </p>

          {/* 10 */}
          <h2 className={styles.secHeading}>10. Workplace Programmes</h2>
          <p className={styles.body}>
            Cancellation and refund terms for workplace or organisational programmes may be governed
            by a separate agreement between The Nest Social and the organisation. Where a separate
            written agreement exists, the terms of that agreement will apply.
          </p>

          {/* 11 */}
          <h2 className={styles.secHeading}>11. How Refunds Are Processed</h2>
          <p className={styles.body}>
            Where a refund is approved, we will initiate the refund through the applicable payment
            method or payment provider. The time taken for the refund to appear in your account may
            depend on the payment provider or financial institution.
          </p>

          {/* 12 */}
          <h2 className={styles.secHeading}>12. Contact Us</h2>
          <address className={styles.address}>
            <strong>The Nest Social</strong>
            <br />
            Operated by Onvera Solutions Private Limited
            <br />
            <br />
            Email: care@thenestsocial.com
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
