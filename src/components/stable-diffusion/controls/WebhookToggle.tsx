
import React from 'react';

interface WebhookToggleProps {
  useWebhook: boolean;
  setUseWebhook: (useWebhook: boolean) => void;
}

const WebhookToggle: React.FC<WebhookToggleProps> = ({
  useWebhook,
  setUseWebhook
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="use-webhook"
        checked={useWebhook}
        onChange={(e) => setUseWebhook(e.target.checked)}
        className="rounded border-gray-300"
      />
      <label htmlFor="use-webhook" className="text-sm text-gray-700">
        Also send to webhook (for advanced processing)
      </label>
    </div>
  );
};

export default WebhookToggle;
