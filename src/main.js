
import Dashboard from './components/dashboard/dashboard.js';
import accountList from './containers/accounts/accountsContainer.js';
import FinalContacts from './containers/contacts/contactsContainer.js';
import FinalOpportunities from './containers/opportunities/opportunitiesContainer.js';
import FinalDetails from './containers/details/detailsContainer.js';

// Routing done here
const Main = () => (
    <main>
        <Switch>
            <Route exact path ='/ps-sandbox/' component={Dashboard}/>
            <Route exact path='/ps-sandbox/accounts' component={accountList} />
            <Route exact path='/ps-sandbox/contacts' component={FinalContacts} />
            <Route exact path='/ps-sandbox/opportunities' component={FinalOpportunities} />
            <Route path='/ps-sandbox/*/*/details' component={FinalDetails} />
        </Switch>
    </main>
);

export default Main;
