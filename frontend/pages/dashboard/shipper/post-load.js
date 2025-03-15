// pages/dashboard/shipper/post-load.js
import Dashboard from '../../../components/layout/Dashboard';
import PostLoad from '../../../components/shipper/PostLoad';
import PrivateRoute from '../../../components/routing/PrivateRoute';

const PostLoadPage = () => {
  return (
    <PrivateRoute>
      <Dashboard>
        <PostLoad />
      </Dashboard>
    </PrivateRoute>
  );
};

export default PostLoadPage;