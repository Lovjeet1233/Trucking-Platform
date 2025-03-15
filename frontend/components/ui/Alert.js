// components/ui/Alert.js
import { useAlert } from '../../context/alert/AlertContext';

const Alert = () => {
  const { alerts } = useAlert();

  return (
    <div className="alert-wrapper">
      {alerts.length > 0 &&
        alerts.map(alert => (
          <div
            key={alert.id}
            className={`mb-4 p-4 rounded ${
              alert.type === 'danger'
                ? 'bg-red-100 border border-red-400 text-red-700'
                : alert.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-blue-100 border border-blue-400 text-blue-700'
            }`}
          >
            <div className="flex justify-between">
              <p>{alert.msg}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Alert;