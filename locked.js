
getUrlParameter = name => {
  const regex = new RegExp(`[?&]${name.replace(/[[\]]/g, '\\$&')}=([^&#]*)`);
  const results = regex.exec(location.search);
  return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : '';
};

const attempts = parseInt(getUrlParameter('attempts')) || 0;
const cooldownMs = parseInt(getUrlParameter('cooldown')) || 0;
const lockedSiteUrl = getUrlParameter('url');

var currentTime = new Date().getTime();
var remainingTimeSeconds = Math.ceil((cooldownMs - currentTime) / 1000);
var formatRemainingTime = remainingTimeSeconds.toString().startsWith('-') ? '0' : remainingTimeSeconds;

let timePassed = 0;
const TIME_LIMIT = parseInt(formatRemainingTime);

const FULL_DASH_ARRAY = formatRemainingTime;
const WARNING_THRESHOLD = formatRemainingTime * 0.50;
const ALERT_THRESHOLD = formatRemainingTime * 0.25;


const COLOR_CODES = {
    info: { color: "red" },
    warning: { color: "orange", threshold: WARNING_THRESHOLD },
    alert: { color: "green", threshold: ALERT_THRESHOLD }
  };

let timeLeft = TIME_LIMIT;
let timerInterval = null;

const formatTime = time => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
};

const setRemainingPathColor = timeLeft => {
  const { alert, warning, info } = COLOR_CODES;
  const remainingPath = document.getElementById("base-timer-path-remaining");
  if (timeLeft <= alert.threshold) {
    remainingPath.classList.remove(warning.color);
    remainingPath.classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    remainingPath.classList.remove(info.color);
    remainingPath.classList.add(warning.color);
  }
};

const calculateTimeFraction = () => {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
};

const setCircleDasharray = () => {
  const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
  document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
};


const startTimer = () => {
    timerInterval = setInterval(() => {
      timePassed += 1;
      timeLeft = TIME_LIMIT - timePassed;
  
      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(timerInterval);
      }
  
      document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
      setCircleDasharray();
      setRemainingPathColor(timeLeft);
    }, 1000);
  };
  

document.getElementById("cooldown-duration").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path id="base-timer-path-remaining" stroke-dasharray="283" class="base-timer__path-remaining ${COLOR_CODES.info.color}"
        d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
</div>
`;

startTimer();
