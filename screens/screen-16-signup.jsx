// NEST · Screen 16 · Sign Up / OTP
// Two states (phone entry → 6-digit OTP). Split layout: door illustration left,
// form right. No password. Warm, minimal friction.

const SignUp = () => {
  const [step, setStep] = React.useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [resendIn, setResendIn] = React.useState(38);
  const otpRefs = React.useRef([]);

  // resend countdown
  React.useEffect(() => {
    if (step !== 'otp' || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  const goToOtp = () => {
    if (phone.trim().length < 6) return;
    setStep('otp');
    setResendIn(38);
    setTimeout(() => otpRefs.current[0]?.focus(), 60);
  };

  const handleOtpChange = (i, v) => {
    const clean = v.replace(/[^0-9]/g, '').slice(0, 1);
    const next = [...otp];
    next[i] = clean;
    setOtp(next);
    if (clean && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
  };

  // pretty timer
  const mm = Math.floor(resendIn / 60).toString().padStart(2, '0');
  const ss = (resendIn % 60).toString().padStart(2, '0');

  return (
    <div className="ns-split">
      {/* LEFT — illustration column on Cream */}
      <div className="ns-split__left">
        <div className="ns-split__brand">
          <Logo size={18} color="#2F4C3A"/>
        </div>
        <div className="ns-split__art">
          <DoorIllustration/>
        </div>
        <figure className="ns-split__quote">
          <blockquote>"I didn't expect to feel this welcomed from the first screen."</blockquote>
          <figcaption>— Riya, 26 · Mumbai</figcaption>
        </figure>
      </div>

      {/* RIGHT — form */}
      <div className="ns-split__right">
        <div className="ns-form-wrap">

          {step === 'phone' && (
            <div className="ns-form" key="phone">
              <h1 className="ns-form__title">You're almost in.</h1>
              <p className="ns-form__sub">No passwords. We'll send a code to your phone.</p>

              <label className="ns-form__label" htmlFor="ns-phone">Phone number</label>
              <div className="ns-form__field">
                <span className="ns-form__prefix">+91</span>
                <input
                  id="ns-phone"
                  className="ns-form__input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9 ]/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && goToOtp()}
                />
              </div>

              <button
                className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
                onClick={goToOtp}
                disabled={phone.trim().length < 6}
              >
                Send code <Arrow size={14}/>
              </button>

              <p className="ns-form__note">We never share your number. Ever.</p>

              <div className="ns-form__divider">
                <span>or</span>
              </div>

              <p className="ns-form__alt">
                Already have an account? <a href="#" className="ns-link">Log in</a>
              </p>

              <p className="ns-form__legal">
                By continuing, you agree to our <a href="#" className="ns-link ns-link--quiet">Privacy Policy</a>.
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="ns-form" key="otp">
              <button className="ns-form__back" onClick={() => setStep('phone')}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M11 7 H 3 M6 4 L 3 7 L 6 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Back</span>
              </button>

              <h1 className="ns-form__title">Check your phone.</h1>
              <p className="ns-form__sub">
                We sent a 6-digit code to <strong>+91 {phone || '98765 43210'}</strong>.
              </p>

              <div className="ns-otp">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    className={'ns-otp__box' + (digit ? ' is-filled' : '')}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              <button
                className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
                disabled={otp.some(d => !d)}
              >
                Verify
              </button>

              <div className="ns-form__resend">
                {resendIn > 0 ? (
                  <span>Resend code in <span className="ns-mono">{mm}:{ss}</span></span>
                ) : (
                  <button className="ns-link" onClick={() => setResendIn(38)}>Resend code</button>
                )}
              </div>

              <p className="ns-form__legal" style={{ marginTop: 24 }}>
                Didn't get the code? Check your spam, or <a href="#" className="ns-link ns-link--quiet">use a different number</a>.
              </p>
            </div>
          )}
        </div>

        {/* small trust strip at bottom */}
        <div className="ns-trust">
          <div className="ns-trust__item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1 L 12 3 V7 Q12 11 7 13 Q2 11 2 7 V3 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M5 7 L 6.5 8.5 L 9 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Encrypted end-to-end</span>
          </div>
          <div className="ns-trust__item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M4 7.5 L 6 9 L 10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Delete your account anytime</span>
          </div>
          <div className="ns-trust__item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M7 4.5 V7 L 9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>3-minute setup, then you're in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

window.SignUp = SignUp;
