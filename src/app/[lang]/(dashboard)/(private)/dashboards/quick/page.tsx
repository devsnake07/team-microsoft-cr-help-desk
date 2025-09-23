// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import WelcomeCard from '@views/dashboards/quick/WelcomeCard'
import InterestedTopics from '@views/dashboards/quick/InterestedTopics'

const QuickDashboard = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <WelcomeCard />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <InterestedTopics />
      </Grid>
    </Grid>
  )
}

export default QuickDashboard
