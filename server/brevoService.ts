import fetch from 'node-fetch';

interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    SMS?: string;
  };
  listIds?: number[];
}

interface BrevoEmailTemplate {
  templateId: number;
  to: Array<{
    email: string;
    name?: string;
  }>;
  params?: Record<string, any>;
}

class BrevoService {
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3';

  constructor() {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable is required');
    }
    this.apiKey = process.env.BREVO_API_KEY;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async addContact(contact: BrevoContact) {
    try {
      return await this.makeRequest('/contacts', 'POST', contact);
    } catch (error) {
      console.error('Error adding contact to Brevo:', error);
      throw error;
    }
  }

  async sendTransactionalEmail(emailData: any) {
    try {
      return await this.makeRequest('/smtp/email', 'POST', emailData);
    } catch (error) {
      console.error('Error sending transactional email:', error);
      throw error;
    }
  }

  async sendScavengerHuntWelcomeEmail(email: string, firstName?: string) {
    try {
      const emailData = {
        sender: {
          name: "Ocks on the Block",
          email: "noreply@ocksontheblock.com" // Replace with your verified sender email
        },
        to: [
          {
            email: email,
            name: firstName || "Hunter"
          }
        ],
        subject: "🏆 Welcome to the $10K Scavenger Hunt!",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff5722; font-size: 28px; margin: 0;">🏆 Welcome to the Hunt!</h1>
                <p style="color: #666; font-size: 18px; margin: 10px 0;">You're officially in the running for $10,000!</p>
              </div>
              
              <div style="background: linear-gradient(45deg, #ff5722, #ff7043); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">NYC Scavenger Hunt</h2>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Find all 5 borough Ocks to win the grand prize!</p>
              </div>
              
              <div style="margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">🎯 How to Win:</h3>
                <ol style="color: #666; line-height: 1.6;">
                  <li><strong>Buy Mystery Boxes</strong> - Get your Ock figurines</li>
                  <li><strong>Find the Locations</strong> - Visit verified corner stores in all 5 boroughs</li>
                  <li><strong>Take Photos</strong> - Snap pics with your figurines at each location</li>
                  <li><strong>Submit for Verification</strong> - Upload through our website</li>
                  <li><strong>Win $10,000!</strong> - First verified completion takes it all</li>
                </ol>
              </div>
              
              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #333; margin-top: 0;">🗽 Borough Locations:</h3>
                <ul style="color: #666; margin: 0; padding-left: 20px;">
                  <li>Manhattan - Broadway & 125th St</li>
                  <li>Brooklyn - Atlantic Ave & Flatbush</li>
                  <li>Queens - Queens Blvd & Roosevelt</li>
                  <li>Bronx - Grand Concourse & 149th</li>
                  <li>Staten Island - Victory Blvd & Forest Ave</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="https://ocksontheblock.com/buy-ocks" style="background-color: #ff5722; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  🛒 Buy Mystery Boxes
                </a>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
                <p><strong>Tips for Success:</strong></p>
                <ul>
                  <li>Higher tier boxes = better figurines = more points</li>
                  <li>Legendary figurines give maximum points</li>
                  <li>Take clear photos with GPS enabled</li>
                  <li>Follow @ocksontheblock for location hints</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  You're receiving this because you joined the Ocks on the Block Scavenger Hunt.
                  <br>Good luck, and may the best hunter win! 🏆
                </p>
              </div>
            </div>
          </div>
        `,
        textContent: `
Welcome to the $10K Scavenger Hunt!

You're officially in the running for $10,000!

How to Win:
1. Buy Mystery Boxes - Get your Ock figurines
2. Find the Locations - Visit verified corner stores in all 5 boroughs  
3. Take Photos - Snap pics with your figurines at each location
4. Submit for Verification - Upload through our website
5. Win $10,000! - First verified completion takes it all

Borough Locations:
• Manhattan - Broadway & 125th St
• Brooklyn - Atlantic Ave & Flatbush  
• Queens - Queens Blvd & Roosevelt
• Bronx - Grand Concourse & 149th
• Staten Island - Victory Blvd & Forest Ave

Buy Mystery Boxes: https://ocksontheblock.com/buy-ocks

Good luck, and may the best hunter win!
        `
      };

      return await this.sendTransactionalEmail(emailData);
    } catch (error) {
      console.error('Error sending scavenger hunt welcome email:', error);
      throw error;
    }
  }

  async addScavengerHuntContact(email: string, firstName?: string, lastName?: string) {
    try {
      const contact: BrevoContact = {
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
        },
        // Add to your scavenger hunt contact list (you'll need to create this list in Brevo)
        // listIds: [1] // Replace with your actual Brevo list ID
      };

      return await this.addContact(contact);
    } catch (error) {
      console.error('Error adding scavenger hunt contact:', error);
      throw error;
    }
  }
}

export const brevoService = new BrevoService();