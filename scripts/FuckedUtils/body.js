if(!Fusion.Commands.SetTimeoutForHost) {
	Fusion.Commands.SetTimeoutForHost = function() { //Host-troll
		Game.SetAutoLaunchEnabled(false)
		Game.SetAutoLaunchEnabled(true)
		Game.SetAutoLaunchDelay(1500000000000)
		Game.SetRemainingSetupTime(400000000000000)
	}
	Game.AddCommand("__SetTimeoutForHost", Fusion.Commands.SetTimeoutForHost, "", 0)
}

if(!Fusion.Commands.Set1TimeoutForHost) {
	Fusion.Commands.Set1TimeoutForHost = function() { //Host-antitroll
		Game.SetAutoLaunchEnabled(false)
		Game.SetAutoLaunchEnabled(true)
		Game.SetAutoLaunchDelay(1)
		Game.SetRemainingSetupTime(1) 
	}

	Game.AddCommand("__Set1TimeoutForHost", Fusion.Commands.Set1TimeoutForHost, "", 0)
}