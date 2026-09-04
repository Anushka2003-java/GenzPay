# GenzPay – An AI-Based Revenue Recovery Agent

> Recover the revenue you almost lost.

GenzPay is an AI-powered revenue recovery agent designed to help merchants identify and recover revenue lost due to failed payments.

Instead of simply showing that a payment has failed, GenzPay analyzes the payment and customer context, recommends the most suitable recovery action, validates the action through safety rules, and tracks the recovery outcome.

## 💡 Core Idea

A failed payment does not always mean lost revenue. Payments can fail because of temporary issues such as network timeouts, payment gateway failures, UPI failures, card declines, or recurring payment problems.

GenzPay identifies these revenue-at-risk payments and helps determine the right next action.

### Recovery Flow

Payment Failure → Revenue Risk Detection → Payment & Customer Analysis → AI Recommendation → Safety Validation → Recovery Action → Recovery Result → Revenue & Analytics Update

### Our Core Principle

**AI thinks. Our safety system checks. GenzPay takes action.**

## 🎯 Problem We Solve

Merchants lose revenue when legitimate payments fail. Traditional payment dashboards usually show that a payment has failed, but do not always help merchants understand why it failed, whether it is worth recovering, what action should be taken, or whether the recovery actually worked.

GenzPay addresses this by detecting payments at risk, analyzing the situation, recommending an appropriate recovery action, validating the recommendation through safety rules, and tracking the result.

## 🚀 Key Features

- Revenue Risk Detection
- AI-Powered Payment Analysis
- Recovery Recommendations
- Safety & Policy Guardrails
- Payment Recovery Simulation
- Recovery Analytics
- Revenue Impact Tracking
- AI Decision Center
- Recovery Case Management
- Detailed Audit Trail

Possible recovery actions include:

- Retry Payment
- Send Payment Link
- Send Reminder
- Mark for Review
- Escalate
- Stop Recovery

## 🔄 Example Recovery

Customer: Rahul Sharma

Amount: ₹2,499

Payment Method: UPI

Failure Reason: Network Timeout

AI Recommendation: Retry Payment

Confidence: 92%

Recovery Probability: 82%

Safety Check: PASSED

Result: Payment Recovered

The recovery result is reflected in the dashboard, analytics, and audit trail.

## 🛡️ Safety First

GenzPay does not blindly execute AI recommendations.

Before a recovery action is performed, the system checks conditions such as:

- Payment status
- Retry limits
- Duplicate recovery attempts
- Recovery eligibility
- Safety policies

This creates a controlled workflow where AI provides the intelligence and deterministic rules provide the safety layer.

## 📊 Dashboard

The GenzPay dashboard provides merchants with an overview of:

- Revenue at Risk
- Recovered Revenue
- Recovery Rate
- Active Recovery Cases
- Payments Analyzed
- Recovery Outcomes
- Payment Failure Reasons

## 🧠 AI Decision Center

The AI Decision Center shows how GenzPay evaluates recovery opportunities.

Each decision can include:

- Payment context
- Failure reason
- AI recommendation
- Confidence
- Expected recovery
- Safety validation
- Final action
- Recovery result

## 📋 Audit Trail

GenzPay records important recovery events so merchants can understand what happened during the recovery process.

Example:

Payment Failed → Revenue Risk Detected → AI Recommendation Generated → Safety Policy Validated → Recovery Action Executed → Payment Recovered

## 🧪 Demo Mode

GenzPay includes a controlled simulation environment for demonstrating the complete recovery workflow without processing real customer payments.

The demo flow is:

Detect → Analyze → AI Decision → Safety Check → Recovery → Result

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

## 📂 Project Structure

```text
GenzPay/
├── public/
├── src/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json

⚙️ Run Locally

Clone the repository:

git clone https://github.com/Anushka2003-java/GenzPay.git

Open the project:

cd GenzPay

Install dependencies:

npm install

Start the development server:

npm run dev

The application will be available at:

http://localhost:5173
🏗️ Production Build

To create a production build:

npm run build

To preview the production build:

npm run preview

└── README.md
