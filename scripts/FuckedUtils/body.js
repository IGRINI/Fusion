function SetTimeoutForHost() { //Host-troll
	Game.SetAutoLaunchEnabled(false)
	Game.SetAutoLaunchEnabled(true)
	Game.SetAutoLaunchDelay(1500000000000)
	Game.SetRemainingSetupTime(400000000000000)
}

function Set1TimeoutForHost() { //Host-antitroll
	Game.SetAutoLaunchEnabled(false)
	Game.SetAutoLaunchEnabled(true)
	Game.SetAutoLaunchDelay(1)
	Game.SetRemainingSetupTime(1) 
}

Game.AddCommand("__SetTimeoutForHost", SetTimeoutForHost, "", 0)
Game.AddCommand("__Set1TimeoutForHost", Set1TimeoutForHost, "", 0)