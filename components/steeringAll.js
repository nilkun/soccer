class SteeringBehaviors {
    
    setTarget(target) {
        this.target = target;
    }

    arrive() { 
        const distanceToTarget = this.target.subtracted(this.position);
        const distance = distanceToTarget.magnitude();
        const deceleration = 20;

        if(distance > 0) {
            let speed = distance / deceleration;
            if(speed > this.maxSpeed) speed = this.maxSpeed;
            return distanceToTarget
                .scaled(speed/distance)
                .subtracted(this.velocity);
        }
        return new Vector;
    }

    update(elapsedTime) {
        const steeringForce = this.steering();
        const acceleration = steeringForce.scaled(1/this.mass);
        this.velocity.add(acceleration.scaled(elapsedTime));
        this.velocity.truncate(this.maxSpeed);
        this.position.add(this.velocity.scaled(elapsedTime));
        const magSquared = this.velocity.x**2 + this.velocity.y**2;
        if(magSquared > 0.00000001) {
            this.heading = this.velocity.normalized();
            this.side = this.heading.perpendicularClockwise();
        }
    }

    steering() {
        // COULD DO CALCULATIONS AFTER ALL VECTORS ARE ADDED?
        let steeringForce = new Vector();
        if(this.arriveIsOn) steeringForce.add(this.arrive());
        if(this.seekIsOn) steeringForce.add(this.seek());
        if(this.pursuitIsOn) steeringForce.add(this.pursuit());
        return steeringForce;
    }

    arriveOn() {
        this.arriveIsOn = true;
    }

    arriveOff() {
        this.arriveIsOn = false;
    }

    seekOn() {
        this.seekIsOn = true;
    }

    seekOff() {
        this.seekIsOn = false;
    }

    pursuitOn() {
        this.pursuitIsOn = true;
    }

    pursuitOff() {
        this.pursuitIsOn = false;
    }
    
    faceTarget(target) {
        this.heading = target.normalized();
        this.side = this.heading.perpendicularClockwise();
    }


    seek() {
        // (target - position) scaled to maxSpeed, and then velocity is subtracted
        return this.target.subtracted(this.position)
            .normalized()
            .scaled(this.maxSpeed)
            .subtracted(this.velocity);
    }

    pursuit() {
        const distanceToTarget = this.lockedOn.position.subtracted(this.position);
        const relativeHeading = this.heading.dot(this.lockedOn.heading);
        
        if((distanceToTarget.dot(this.heading) > 0)
            && relativeHeading < -0.95) { //acos(0.95) = 18 degrees;
                return this.target.subtracted(this.position)
                    .normalized()
                    .scaled(this.maxSpeed)
                    .subtracted(this.velocity);
            }
        const lookAheadTime = distanceTothis.lockedOn.magnitude() / (this.maxSpeed + this.lockedOn.maxSpeed);
        this.target = this.lockedOn.position.added(this.lockedOn.velocity.scaled(lookAheadTime)); 
        
        return this.target.subtracted(this.position)
            .normalized()
            .scaled(this.maxSpeed)
            .subtracted(this.velocity);
    }
