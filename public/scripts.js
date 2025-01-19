document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display disease statistics
    fetch('https://api.example.com/disease-statistics')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const diseaseNames = data.map(disease => disease.name);
            const prevalence = data.map(disease => disease.prevalence);
            const mortalityRates = data.map(disease => disease.mortalityRate);

            const ctx = document.getElementById('disease-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: diseaseNames,
                    datasets: [
                        {
                            label: 'Prevalence',
                            data: prevalence,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Mortality Rate',
                            data: mortalityRates,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching statistics:', error));

    // Toggle common diseases section
    document.getElementById('diseases-link').addEventListener('click', function(event) {
        event.preventDefault();
        toggleSection('common-diseases');
    });

    // Toggle nearby pharmacies section
    document.getElementById('pharmacies-link').addEventListener('click', function(event) {
        event.preventDefault();
        toggleSection('nearby-pharmacies');
    });

    // Handle finding nearby pharmacies
    document.getElementById('find-pharmacies').addEventListener('click', function() {
        const pincode = document.getElementById('pincode').value;
        if (pincode) {
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=AIzaSyAE5CKxcDjOf5vZ8wPigL0MveqN7TvPSYs`)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        const location = data.results[0].geometry.location;
                        const map = new google.maps.Map(document.getElementById('map'), {
                            center: location,
                            zoom: 14
                        });

                        const service = new google.maps.places.PlacesService(map);
                        service.nearbySearch({
                            location: location,
                            radius: 5000,
                            type: ['pharmacy']
                        }, function(results, status) {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                const pharmaciesList = document.getElementById('pharmacies-list');
                                pharmaciesList.innerHTML = '';
                                results.forEach(place => {
                                    const marker = new google.maps.Marker({
                                        map: map,
                                        position: place.geometry.location
                                    });

                                    const pharmacyItem = document.createElement('div');
                                    pharmacyItem.className = 'pharmacy-item';
                                    pharmacyItem.innerHTML = `
                                        <h3>${place.name}</h3>
                                        <p>${place.vicinity}</p>
                                        <a href="https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}" target="_blank">Get Directions</a>
                                    `;
                                    pharmaciesList.appendChild(pharmacyItem);
                                });
                            }
                        });
                    } else {
                        alert('Invalid pincode');
                    }
                })
                .catch(error => console.error('Error fetching location:', error));
        } else {
            alert('Please enter a pincode');
        }
    });

    // Initialize and render the chatbot
    (async function() {
        const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_DIRECT_LINE_SECRET'
            }
        });
        const { token } = await res.json();

        window.WebChat.renderWebChat({
            directLine: window.WebChat.createDirectLine({ token }),
            userID: 'YOUR_USER_ID',
            username: 'YOUR_USER_NAME',
            locale: 'en-US'
        }, document.getElementById('webchat'));
    })();
});

function toggleSection(sectionId) {
    const sections = ['welcome', 'health-facts', 'statistics', 'common-diseases', 'nearby-pharmacies'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            if (id === sectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        }
    });
}
